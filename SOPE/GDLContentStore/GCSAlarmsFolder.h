/* GCSAlarmsFolder.h - this file is part of $PROJECT_NAME_HERE$
 *
 * Copyright (C) 2010 Inverse inc.
 *
 * Author: Wolfgang Sourdeau <wsourdeau@inverse.ca>
 *
 * This file is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2, or (at your option)
 * any later version.
 *
 * This file is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; see the file COPYING.  If not, write to
 * the Free Software Foundation, Inc., 59 Temple Place - Suite 330,
 * Boston, MA 02111-1307, USA.
 */

#ifndef GCSALARMSFOLDER_H
#define GCSALARMSFOLDER_H

#import <Foundation/NSObject.h>

@class NSCalendarDate;
@class NSException;
@class NSNumber;
@class NSString;

@class GCSFolderManager;

@interface GCSAlarmsFolder : NSObject
{
  GCSFolderManager *folderManager;
}

+ (id) alarmsFolderWithFolderManager: (GCSFolderManager *) newFolderManager;

- (void) setFolderManager: (GCSFolderManager *) newFolderManager;

/* operations */

- (void) createFolderIfNotExists;
- (BOOL) canConnectStore;

- (NSDictionary *) recordForEntryWithCName: (NSString *) cname
                          inCalendarAtPath: (NSString *) path;
- (NSArray *) recordsForEntriesFromDate: (NSCalendarDate *) fromDate
                                 toDate: (NSCalendarDate *) toDate;

- (void) writeRecordForEntryWithCName: (NSString *) cname
                     inCalendarAtPath: (NSString *) path
                               forUID: (NSString *) uid
                         recurrenceId: (NSCalendarDate *) recId
                          alarmNumber: (NSNumber *) alarmNbr
                         andAlarmDate: (NSCalendarDate *) alarmDate;

- (void) deleteRecordForEntryWithCName: (NSString *) cname
                      inCalendarAtPath: (NSString *) path;

- (void) deleteRecordsForEntriesUntilDate: (NSCalendarDate *) date;

@end

#endif /* GCSALARMSFOLDER_H */
