import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {RootNavigationProps, TimeTableData} from './types';
import {StackNavigationProp} from '@react-navigation/stack';
import {Agenda, LocaleConfig} from 'react-native-calendars';
import {Avatar, Card, useTheme} from 'react-native-paper';
import {colors} from '../assets/css/colors';
import {RouteProp, Theme} from '@react-navigation/native';
import {studentWeeklyTimeTableDates} from '../mock/weeklyTimeTable';
import {
  Col,
  ColProps,
  Row,
  Table,
  TableWrapper,
} from 'react-native-table-component';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MemoizedCard from '../components/MemoizedCard';
interface MyProps {
  navigation: StackNavigationProp<
    RootNavigationProps,
    'WeeklyTimeTableTeacher'
  >;
  route: RouteProp<{params: {year: string; semesterId: number}}, 'params'>;
}

type Item = {
  name: string;
  slotTime: string; // Thêm slotTime vào kiểu dữ liệu Item
  teacher: string;
  slot: string;
  status: string;
  numberOfSlotsWithData?: number;
  // height: number;
};

type Items = {
  [key: string]: Item[];
};
interface CustomColProps extends ColProps {
  widthArr?: number[];
}
const getFormattedDate = (date: Date): string => {
  const day: string = String(date.getDate()).padStart(2, '0');
  const month: string = String(date.getMonth() + 1).padStart(2, '0');
  const year: number = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getMondayOfWeek = (date: Date): Date => {
  const currentDay: number = date.getDay();
  const distanceToMonday: number = (currentDay + 6) % 7; // Calculate the distance to the last Monday
  const monday: Date = new Date(date);
  monday.setDate(date.getDate() - distanceToMonday);
  return monday;
};

const getMondayOfCurrentWeek = (): Date => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const distanceToMonday = (dayOfWeek + 6) % 7; // Calculate distance to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);
  return monday;
};

const getFormattedMondayOfWeek = (date: Date): string => {
  return getFormattedDate(getMondayOfWeek(date));
};

const formattedMondayOfCurrentWeek: string = getFormattedMondayOfWeek(
  new Date(),
);

console.log(formattedMondayOfCurrentWeek);

const timeToString = (time: number): string => {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
};

const WeeklyTimeTableTeacher = ({navigation, route}: MyProps) => {
  // const [monday, setMonday] = useState(getFormattedMondayOfWeek(new Date()));
  //   const {year} = route.params;
  const [monday, setMonday] = useState(
    getFormattedDate(getMondayOfCurrentWeek()),
  );
  const [selectedDate, setSelectedDate] = useState(
    timeToString(getMondayOfCurrentWeek().getTime()),
  );
  const [weeklyTimeTable, setWeeklyTimeTable] = useState<TimeTableData | null>(
    null,
  );
  const [fromDatee, setFromDatee] = useState<string | null>();
  const [toDatee, setToDatee] = useState<string | null>();
  const [classData, setClassData] = useState<string | null>();
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<Items>({});
  const [currentMonth, setCurrentMonth] = useState(getMondayOfCurrentWeek());
  const agendaRef = useRef(null);
  // const [items, setItems] = useState<Items>({});
  // const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchTimeTable = useCallback(
    async (userId: string) => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken'); //${userId}
        const response = await fetch(
          `https://orbapi.click/api/Schedules/Student?studentID=HS0001&schoolYear=2024-2025&fromDate=${monday}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        const timeTableData = await response.json();
        console.log('Time table data:', timeTableData);
        if (timeTableData) {
          const processedItems = processTimeTableData(timeTableData);
          setWeeklyTimeTable(timeTableData);
          setItems(processedItems);
          setFromDatee(timeTableData.fromDate);
          setToDatee(timeTableData.toDate);
          setClassData(timeTableData.class);
        } else {
          // setError(timeTableData.message);
        }
      } catch (error) {
        console.error('Error fetching timetable data', error);
      }
    },
    [monday],
  );

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
          fetchTimeTable(storedUserId);
        } else {
          console.error('No user ID found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching user ID from AsyncStorage', error);
      }
    };

    fetchUserId();
  }, [fetchTimeTable]);

  useEffect(() => {
    navigation.setOptions({
      title: 'Thời khóa biểu',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            style={styles.imge}
            source={require('../assets/images/icons/Back.png')}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const processTimeTableData = useCallback(
    (timeTableData: TimeTableData['data']): Items => {
      const newItems: Items = {};
      if (timeTableData.details) {
        timeTableData.details.forEach(detail => {
          const date = convertDateFormat(detail.date);
          const filteredSlots = detail.slots.filter(
            slot =>
              slot.subject !== '' &&
              slot.teacher !== '' &&
              slot.status !== '' &&
              slot.slotTime !== '',
          );

          if (filteredSlots.length === 0) {
            newItems[date] = [
              {
                name: 'Không có tiết học cho ngày hôm nay',
                slotTime: '',
                teacher: '',
                slot: '',
                status: '',
              },
            ];
          } else {
            newItems[date] = filteredSlots.map(slot => ({
              name: `Môn học: ${slot.subject}`,
              slotTime: slot.slotTime,
              teacher: `Giáo viên: ${slot.teacher}`,
              slot: `${slot.slot}`,
              status: `${slot.status}`,
            }));
          }
        });
      }
      return newItems;
    },
    [],
  );

  // const fromDate = studentWeeklyTimeTableDates.data.fromDate;
  // const toDate = studentWeeklyTimeTableDates.data.toDate;
  const convertDateFormat = (dateString: string): string => {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };

  const loadItems = useCallback(
    (day: any) => {
      setTimeout(() => {
        const newItems: Items = {...items};
        if (fromDatee && toDatee && weeklyTimeTable && weeklyTimeTable.data) {
          const fromDate = new Date(convertDateFormat(fromDatee));
          const toDate = new Date(convertDateFormat(toDatee));

          for (
            let date = new Date(fromDate);
            date <= toDate;
            date.setDate(date.getDate() + 1)
          ) {
            const strTime = timeToString(date.getTime());
            if (!newItems[strTime]) {
              newItems[strTime] = [];
              const dayDetail = weeklyTimeTable.data.details.find(
                detail => convertDateFormat(detail.date) === strTime,
              );
              if (dayDetail) {
                const numberOfSlotsWithData = dayDetail.slots.filter(
                  slot => slot.subject !== '' && slot.teacher !== '',
                ).length;

                if (numberOfSlotsWithData === 0) {
                  newItems[strTime].push({
                    name: 'Không có tiết học cho ngày hôm nay',
                    slotTime: '',
                    teacher: '',
                    slot: '',
                    status: '',
                  });
                } else {
                  newItems[strTime] = dayDetail.slots
                    .filter(
                      slot =>
                        slot.subject !== '' &&
                        slot.teacher !== '' &&
                        slot.status !== '' &&
                        slot.slotTime !== '',
                    )
                    .map(slot => ({
                      name: `Môn học: ${slot.subject}`,
                      slotTime: slot.slotTime,
                      teacher: `Giáo viên: ${slot.teacher}`,
                      slot: `${slot.slot}`,
                      status: `${slot.status}`,
                    }));
                }
              } else {
                newItems[strTime].push({
                  name: 'Không có tiết học cho ngày hôm nay',
                  slotTime: '',
                  teacher: '',
                  slot: '',
                  status: '',
                });
              }
            }
          }
        }
        setItems(newItems);
      }, 1000);
    },
    [fromDatee, toDatee, weeklyTimeTable, items, convertDateFormat],
  );

  const getSlotsForDay = (date: Date): any[] | null => {
    const dayOfWeek = date.getDay();
    const weekDate = getWeekDayName(dayOfWeek);
    if (weekDate !== '') {
      const dayDetails = weeklyTimeTable?.data.details.find(
        detail => detail.weekDate === weekDate,
      );

      if (dayDetails) {
        return dayDetails.slots;
      }
    }
    return null;
  };

  const vietnameseDayToNumberMapping: {[key: string]: number} = {
    'Chủ Nhật': 0,
    'Thứ Hai': 1,
    'Thứ Ba': 2,
    'Thứ Tư': 3,
    'Thứ Năm': 4,
    'Thứ Sáu': 5,
    'Thứ Bảy': 6,
  };

  const vietnameseDayToEnglishDayMapping: {[key: string]: string} = {
    'Chủ Nhật': 'Sun',
    'Thứ Hai': 'Mon',
    'Thứ Ba': 'Tue',
    'Thứ Tư': 'Wed',
    'Thứ Năm': 'Thu',
    'Thứ Sáu': 'Fri',
    'Thứ Bảy': 'Sat',
  };

  const vietnameseDayToNumber = (dayText: string): number | undefined => {
    return vietnameseDayToNumberMapping[dayText];
  };

  const getWeekDayName = (dayIndex: number): string => {
    const vietnameseDay = Object.keys(vietnameseDayToNumberMapping).find(
      key => vietnameseDayToNumberMapping[key] === dayIndex,
    );
    if (vietnameseDay) {
      return vietnameseDayToEnglishDayMapping[vietnameseDay];
    }
    return '';
  };
  // const CustomCol: React.FC<CustomColProps> = ({widthArr, ...rest}) => {
  //   return <Col {...rest} />;
  // };

  const renderItem = useCallback(
    (item: Item, index: number, numberOfSlotsWithData: number) => {
      const isFirstItemOfDay =
        index === 0 ||
        (index > 0 && Object.values(items)[index - 1]?.[0]?.slot !== item.slot);

      const isFirstDayOfTheWeek =
        index === 0 ||
        Object.keys(items)[index] !== Object.keys(items)[index - 1];

      const tableContainerHeight = item.name.startsWith('Không có tiết học')
        ? 20
        : 70;

      if (item.name.startsWith('Không có tiết học')) {
        return (
          <>
            {isFirstDayOfTheWeek && (
              <View
                style={{
                  paddingTop: 50,
                  marginRight: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: 'gray',
                  width: '20%',
                }}
              />
            )}
            <TouchableOpacity
              style={{
                marginRight: 10,
                marginTop: 17,
                height: tableContainerHeight,
              }}>
              <Card>
                <Card.Content>
                  <Text>{item.name}</Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          </>
        );
      } else {
        let statusBackgroundColor;
        let statusTextColor = colors.whiteColor;
        let statusWidth = 70;

        if (item.status === 'Vắng') {
          statusBackgroundColor = 'red';
        } else if (item.status === 'Có mặt') {
          statusBackgroundColor = 'green';
        } else if (item.status === 'Chưa bắt đầu') {
          statusBackgroundColor = 'gray';
          statusWidth = 100;
        }

        return (
          <>
            {isFirstDayOfTheWeek && (
              <View
                style={{
                  paddingTop: 50,
                  marginRight: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: 'gray',
                  width: '20%',
                }}
              />
            )}
            <MemoizedCard
              key={item.slot + item.teacher + item.slotTime}
              item={item}
            />
          </>
        );
      }
    },
    [items],
  );

  const renderHeader = (date: any) => {
    const month = date.month ? date.month : date.toString().split(' ')[1];
    const year = date.year ? date.year : date.toString().split(' ')[3];
    return (
      <View style={{padding: 10, alignItems: 'center'}}>
        <Text>{`${month.padStart(2, '0')}/${year}`}</Text>
      </View>
    );
  };

  const getMonthName = (monthIndex: number): string => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return monthNames[monthIndex];
  };
  const renderCalendarHeader = () => {
    const monthName = currentMonth.toLocaleString('default', {month: 'long'});
    const year = currentMonth.getFullYear();
    const startDate = new Date();
    const endDate = new Date();
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Ngày đầu tiên của tuần
    endDate.setDate(endDate.getDate() - endDate.getDay() + 7); // Ngày cuối cùng của tuần

    const formatter = new Intl.DateTimeFormat('en', {
      day: '2-digit',
      month: '2-digit',
    });
    const startDay = formatter.format(startDate).split('/')[0].padStart(2, '0'); // Ensure two digits
    const startMonth = formatter
      .format(startDate)
      .split('/')[1]
      .padStart(2, '0'); // Ensure two digits
    const endDay = formatter.format(endDate).split('/')[0].padStart(2, '0'); // Ensure two digits
    const endMonth = formatter.format(endDate).split('/')[1].padStart(2, '0'); // Ensure two digits

    // const weekRange = `${startDay}/${startMonth} - ${endDay}/${endMonth}`;
    const weekRange = `${startMonth}/${startDay} - ${endMonth}/${endDay}`;
    // console.log(weekRange);
    return (
      <View>
        <View style={styles.textCenter}>
          <Text>Tuần hiện tại</Text>
          <Text style={styles.textCurrentWeek}>{weekRange}</Text>
        </View>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => handleWeekChange('prev')}>
            <Text style={styles.prevButton}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>
            {monthName} {year}
          </Text>
          <TouchableOpacity onPress={() => handleWeekChange('next')}>
            <Text style={styles.nextButton}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleWeekChange = useCallback(
    (direction: 'prev' | 'next') => {
      const newMonth = new Date(currentMonth);
      const currentMonday = getMondayOfWeek(
        new Date(monday.split('/').reverse().join('-')),
      );
      if (direction === 'prev') {
        newMonth.setDate(newMonth.getDate() - 7);
        currentMonday.setDate(currentMonday.getDate() - 7);
      } else {
        newMonth.setDate(newMonth.getDate() + 7);
        currentMonday.setDate(currentMonday.getDate() + 7);
      }
      setCurrentMonth(newMonth);
      setMonday(getFormattedDate(currentMonday));
      setSelectedDate(timeToString(currentMonday.getTime()));
      setItems({});
    },
    [currentMonth, monday],
  );

  // const handleDayPress = (day: any) => {
  //   const selectedDate = new Date(day.timestamp);
  //   const monday = getMondayOfWeek(selectedDate);
  //   setCurrentMonth(monday);
  //   setMonday(getFormattedDate(monday));
  //   setSelectedDate(timeToString(monday.getTime()));
  //   setItems({});
  // };
  const handleDayPress = useCallback(
    (day: any) => {
      const selectedDate = new Date(day.timestamp);
      const mondayOfSelectedDate = getMondayOfWeek(selectedDate);

      const currentMonday = getMondayOfWeek(currentMonth);
      const currentSunday = new Date(currentMonday);
      currentSunday.setDate(currentSunday.getDate() + 6);

      if (selectedDate < currentMonday || selectedDate > currentSunday) {
        setCurrentMonth(mondayOfSelectedDate);
        setMonday(getFormattedDate(mondayOfSelectedDate));
        setSelectedDate(timeToString(mondayOfSelectedDate.getTime()));
        setItems({});
      }
    },
    [currentMonth],
  );

  const [agendaCurrentMonth, setAgendaCurrentMonth] = useState(new Date());
  const handleVisibleMonthsChange = (months: any[]) => {
    if (months.length > 0) {
      const newMonth = new Date(months[0].dateString);
      setCurrentMonth(newMonth);
      setAgendaCurrentMonth(newMonth); // Cập nhật agendaCurrentMonth
    }
  };
  const theme = useTheme();

  return (
    <View style={{flex: 1}}>
      <View style={styles.textCenter}>
        <Text style={styles.textSemester}>{classData}</Text>
      </View>

      {renderCalendarHeader()}
      <Agenda
        key={agendaCurrentMonth.getTime()} // Sử dụng key duy nhất dựa trên thời gian của currentMonth
        ref={agendaRef}
        items={items}
        loadItemsForMonth={loadItems}
        selected={currentMonth.toISOString().split('T')[0]}
        // selected={timeToString(getMondayOfCurrentWeek().getTime())}
        renderItem={renderItem}
        current={currentMonth}
        onDayPress={handleDayPress}
        VisibleMonthsChange={handleVisibleMonthsChange}
        firstDay={1}
        theme={{
          dayTextColor: colors.primaryColor,
          textSectionTitleColor: theme.colors.onBackground,
          textMonthFontWeight: 'bold',
          todayTextColor: colors.blackColor,
          todayDotColor: colors.blackColor,
          textDayHeaderFontWeight: 'bold',
          selectedDayBackgroundColor: 'transparent',
          selectedDayTextColor: colors.primaryColor,
        }}
      />
    </View>
  );
};

export default WeeklyTimeTableTeacher;

const styles = StyleSheet.create({
  col: {
    // Các thuộc tính style cho cột
    justifyContent: 'center', // Canh giữa nội dung của cột
    alignItems: 'center', // Canh giữa theo chiều dọc của cột
  },
  wrapper: {flexDirection: 'row'},
  tableContainer: {
    flex: 1,
    padding: 5,
    paddingTop: 30,
    margin: 0,
    // height: 80,
  },
  // Style cho row
  row: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: colors.whiteColor,
  },
  // Style cho text trong row
  text: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  textSemester: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.blackColor,
    marginBottom: 10,
    marginTop: 0,
  },
  textCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCurrentWeek: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryColor,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 5,
    backgroundColor: colors.whiteColor,
  },
  headerText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.blackColor,
  },
  prevButton: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  nextButton: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    width: '100%',
    height: 60,
    backgroundColor: 'white',
    elevation: 5,
    justifyContent: 'center',
    paddingLeft: 20,
  },
  title: {
    color: 'black',
    fontSize: 18,
    fontWeight: '600',
  },
  imge: {
    width: 27,
    height: 27,
    tintColor: '#FFFFFF',
    marginLeft: 10,
  },
  btn: {
    width: 200,
    height: 50,
    borderRadius: 30,
    position: 'absolute',
    right: 20,
    bottom: 20,
    // top: 700,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  notesItem: {
    width: '90%',
    height: 100,
    borderRadius: 15,
    alignSelf: 'center',
    marginBottom: 18,
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    elevation: 5,
  },
  noDataView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationTitle: {
    color: 'black',
    fontWeight: '500',
    paddingBottom: 10,
  },
  notificationsDate: {color: 'black'},
});
