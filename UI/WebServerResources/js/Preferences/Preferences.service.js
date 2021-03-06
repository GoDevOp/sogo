/* -*- Mode: javascript; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

(function() {
  'use strict';

  /**
   * @name Preferences
   * @constructor
   */
  function Preferences() {
    var _this = this;

    this.defaults = {};
    this.settings = {};

    this.defaultsPromise = Preferences.$$resource.fetch("jsonDefaults").then(function(data) {
      // We swap $key -> _$key to avoid an Angular bug (https://github.com/angular/angular.js/issues/6266)
      var labels = _.object(_.map(data.SOGoMailLabelsColors, function(value, key) {
        if (key.charAt(0) == '$')
          return ['_' + key, value];
        return [key, value];
      }));

      data.SOGoMailLabelsColors = labels;

      // We convert our list of autoReplyEmailAddresses/forwardAddress into a string.
      // We also convert our date objects into real date, otherwise we'll have strings
      // or undefined values and the md-datepicker does NOT like this.
      if (data.Vacation) {
        if (data.Vacation.endDate)
          data.Vacation.endDate = new Date(parseInt(data.Vacation.endDate) * 1000);
        else {
          data.Vacation.endDateEnabled = 0;
          data.Vacation.endDate = new Date();
        }

        if (data.Vacation.autoReplyEmailAddresses)
          data.Vacation.autoReplyEmailAddresses = data.Vacation.autoReplyEmailAddresses.join(",");
      } else {
        data.Vacation = {};
        data.Vacation.endDateEnabled = 0;
        data.Vacation.endDate = new Date();
      }

      if (data.Forward && data.Forward.forwardAddress)
        data.Forward.forwardAddress = data.Forward.forwardAddress.join(",");

      angular.extend(_this.defaults, data);

      return _this.defaults;
    });

    this.settingsPromise = Preferences.$$resource.fetch("jsonSettings").then(function(data) {
        // We convert our PreventInvitationsWhitelist hash into a array of user
        if (data.Calendar && data.Calendar.PreventInvitationsWhitelist)
          data.Calendar.PreventInvitationsWhitelist = _.map(data.Calendar.PreventInvitationsWhitelist, function(value, key) {
            var match = /^(.+)\s<(\S+)>$/.exec(value);
            return new Preferences.$User({uid: key, cn: match[1], c_email: match[2]});
          });

      angular.extend(_this.settings, data);

      return _this.settings;
    });
  }

  /**
   * @memberof Preferences
   * @desc The factory we'll use to register with Angular
   * @returns the Preferences constructor
   */
  Preferences.$factory = ['$q', '$timeout', '$log', 'sgSettings', 'Resource', 'User', function($q, $timeout, $log, Settings, Resource, User) {
    angular.extend(Preferences, {
      $q: $q,
      $timeout: $timeout,
      $log: $log,
      $$resource: new Resource(Settings.activeUser('folderURL'), Settings.activeUser()),
      activeUser: Settings.activeUser(),
      $User: User
    });

    return new Preferences(); // return unique instance
  }];

  /* Initialize module if necessary */
  try {
    angular.module('SOGo.PreferencesUI');
  }
  catch(e) {
    angular.module('SOGo.PreferencesUI', ['SOGo.Common']);
  }

  /* Factory registration in Angular module */
  angular.module('SOGo.PreferencesUI')
    .factory('Preferences', Preferences.$factory);

  /**
   * @function ready
   * @memberof Preferences.prototype
   * @desc Combine promises used to load user's defaults and settings.
   * @return a combined promise
   */
  Preferences.prototype.ready = function() {
    return Preferences.$q.all([this.defaultsPromise, this.settingsPromise]);
  };

  /**
   * @function $save
   * @memberof Preferences.prototype
   * @desc Save the preferences to the server.
   */
  Preferences.prototype.$save = function() {
    var _this = this;

    return Preferences.$$resource.save("Preferences", this.$omit(true))
      .then(function(data) {
        // Make a copy of the data for an eventual reset
        //_this.$shadowData = _this.$omit(true);
        return data;
      });
  };

  /**
   * @function $omit
   * @memberof Preferences.prototype
   * @desc Return a sanitized object used to send to the server.
   * @param {Boolean} [deep] - make a deep copy if true
   * @return an object literal copy of the Preferences instance
   */
  Preferences.prototype.$omit = function(deep) {
    var preferences = {};
    angular.forEach(this, function(value, key) {
      if (key != 'constructor' && key[0] != '$') {
        if (deep)
          preferences[key] = angular.copy(value);
        else
          preferences[key] = value;
      }
    });

    // We swap _$key -> $key to avoid an Angular bug (https://github.com/angular/angular.js/issues/6266)
    var labels = _.object(_.map(preferences.defaults.SOGoMailLabelsColors, function(value, key) {
      if (key.charAt(0) == '_' && key.charAt(1) == '$')
        return [key.substring(1), value];
      return [key, value];
    }));

    preferences.defaults.SOGoMailLabelsColors = labels;

    if (preferences.defaults.Vacation) {
      if (preferences.defaults.Vacation.endDateEnabled)
        preferences.defaults.Vacation.endDate = preferences.defaults.Vacation.endDate.getTime()/1000;
      else
        preferences.defaults.Vacation.endDate = 0;

      if (preferences.defaults.Vacation.autoReplyEmailAddresses)
        preferences.defaults.Vacation.autoReplyEmailAddresses = preferences.defaults.Vacation.autoReplyEmailAddresses.split(",");
    }

    if (preferences.defaults.Forward && preferences.defaults.Forward.forwardAddress)
      preferences.defaults.Forward.forwardAddress = preferences.defaults.Forward.forwardAddress.split(",");

    if (preferences.settings.Calendar && preferences.settings.Calendar.PreventInvitationsWhitelist) {
      var h = {};
      _.each(preferences.settings.Calendar.PreventInvitationsWhitelist, function(user) {
        h[user.uid] = user.$shortFormat();
      });
      preferences.settings.Calendar.PreventInvitationsWhitelist = h;
    }

    return preferences;
  };

})();
