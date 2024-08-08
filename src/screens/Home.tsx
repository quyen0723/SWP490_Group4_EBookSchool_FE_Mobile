import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  SafeAreaView,
  Alert,
  TextInput,
  Button,
  InteractionManager,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import Splash from './Splash';
import {
  NavigationContainer,
  useFocusEffect,
  useIsFocused,
  useRoute,
} from '@react-navigation/native';
import Loader from '../components/Loader';
import {colors} from '../assets/css/colors';
import {
  DrawerNavigationProp,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import {
  ItemType,
  SectionType,
  sectionByParent,
  sectionByStudent,
  sectionByTeacher,
} from '../components/Data';
import {handleLogout} from '../components/Handle';
import ButtonTab from '../navigations/ButtonTab';
import {RootNavigationProps} from './types';
import Profile from './Profile';
import Notification from './Notification';
import {useNavigation} from '@react-navigation/native';
import WeeklyTimeTable from './WeeklyTimeTable';
import Attendance from './Attendance';
import ScoreMain from './ScoreMain';
import Calculate from './Calculate';
import WeeklyTimeTableMain from './WeeklyTimeTableMain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFetchTimeTable} from '../hooks/useFetchTimeTable';
// interface MyProps {
//   navigation: StackNavigationProp<RootNavigationProps, 'Home'>;
// }

interface MyProps {
  navigation: DrawerNavigationProp<RootNavigationProps, 'Home'>; // Sử dụng DrawerNavigationProp thay vì StackNavigationProp
}
function getFormattedMondayOfCurrentWeek(): string {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const distanceToMonday = (dayOfWeek + 6) % 7; // Calculate distance to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);
  const day: string = String(monday.getDate()).padStart(2, '0');
  const month: string = String(monday.getMonth() + 1).padStart(2, '0');
  const year: number = monday.getFullYear();
  return `${day}/${month}/${year}`;
}
const renderFlatList = ({
  item,
  navigation,
  role,
  timeTableData,
}: {
  item: SectionType;
  navigation?: MyProps;
  role: string | null;
  timeTableData: any;
}) => (
  <>
    {renderSectionHeader({section: item})}
    <FlatList
      data={item.data}
      renderItem={({item}) =>
        renderItem({item, navigation: navigation!, role, timeTableData})
      }
      keyExtractor={item => item.id.toString()}
      numColumns={item.data.length === 1 ? 1 : 2}
      key={item.data.length === 1 ? 'h' : 'v'} // Thêm key để buộc FlatList render lại khi numColumns thay đổi
      contentContainerStyle={styles.contentContainerStyle}
      horizontal={item.data.length === 1}
    />
  </>
);

const handleItemClickAction = ({
  item,
  navigation,
  role,
  timeTableData,
}: {
  item: ItemType;
  navigation?: MyProps;
  role: string | null;
  timeTableData: any;
}) => {
  // if (!role && (itemId === '2' || itemId === '4')) {
  //   console.log('Navigation prevented for item:', itemId);
  //   return;
  // }

  if (navigation) {
    const itemId = item.id.toString();
    if (itemId === '1') {
      console.log('Item IDĐ:', item.id);
      navigation.navigate('Notification');
    } else if (itemId === '2') {
      console.log('hhhhhhhhhhhhhhhhh', role);
      // if (role === 'Admin') {
      //   navigation.navigate('WeeklyTimeTableTeacher');
      // } else {
      navigation.navigate('WeeklyTimeTableMain', {timeTableData});
      // }
    } else if (itemId === '3') {
      navigation.navigate('Calculate');
    } else if (itemId === '4') {
      navigation.navigate('Attendance');
    } else if (itemId === '5') {
      navigation.navigate('ScoreMain');
    } else {
      // Handle other item IDs or show an alert
      console.log('Item ID:', item.id);
    }
  } else {
    console.error('Navigation prop is undefined');
  }
};

const renderSectionHeader = ({section: {title}}: {section: SectionType}) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionHeader}>{title}</Text>
  </View>
);
const renderItem = ({
  item,
  navigation,
  role,
  timeTableData,
}: {
  item: ItemType;
  navigation: MyProps;
  role: string | null;
  timeTableData: any;
}) => {
  const handleItemClick = () => {
    handleItemClickAction({item, navigation, role, timeTableData});
  };

  return (
    <TouchableOpacity style={styles.item} onPress={handleItemClick}>
      <Image source={item.image} style={styles.img}></Image>
      <Text style={styles.textItem}>{item.title}</Text>
    </TouchableOpacity>
  );
};

function HomeScreen({navigation}: MyProps) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [monday, setMonday] = useState<string>(
    getFormattedMondayOfCurrentWeek(),
  );
  const [timeTableData, setTimeTableData] = useState<any>(null);

  const fetchUserRole = async () => {
    try {
      const storedRole = await AsyncStorage.getItem('userRoles');
      if (storedRole) {
        const parsedRoles = JSON.parse(storedRole);
        setRole(parsedRoles[0]);
        console.log('User role:', parsedRoles[0]);
      } else {
        console.error('No user roles found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error fetching user roles from AsyncStorage', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdditionalData = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedSchoolYears = await AsyncStorage.getItem('userSchoolYears');
      const currentMonday = getFormattedMondayOfCurrentWeek();

      if (storedUserId && storedSchoolYears) {
        const schoolYears = JSON.parse(storedSchoolYears);
        setUserId(storedUserId);
        setYear(schoolYears[0]); // Lấy năm học đầu tiên từ mảng
        setMonday(currentMonday);
        console.log('User ID:', storedUserId);
        console.log('Year:', schoolYears[0]);
        console.log('Monday:', currentMonday);
      } else {
        console.error('No user ID or school years found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error fetching additional data from AsyncStorage', error);
    }
  };

  const fetchTimeTable = useCallback(async () => {
    // if (!userId || !year) return;

    console.log('Fetching timetable...');
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const roles = JSON.parse(
        (await AsyncStorage.getItem('userRoles')) || '[]',
      );
      let url = '';

      if (roles.includes('Student') || roles.includes('Parent')) {
        url = `https://orbapi.click/api/Schedules/Student?studentID=${userId}&schoolYear=${year}&fromDate=${monday}`;
      } else if (roles.includes('Subject Teacher') || roles.includes('Admin')) {
        url = `https://orbapi.click/api/Schedules/SubjectTeacher?teacherID=${userId}&schoolYear=${year}&fromDate=${monday}`;
      } else if (roles.includes('HomeroomTeacher')) {
        url = `https://orbapi.click/api/Schedules/HomeroomTeacher?teacherID=${userId}&schoolYear=${year}&fromDate=${monday}`;
      }

      console.log('Fetching timetable for year:', year);
      if (url) {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const textResponse = await response.text();
        console.log('Response:', textResponse);
        if (textResponse === 'Không tìm thấy lớp học') {
          return {data: null, message: 'Không tìm thấy lớp học'};
        }
        const data = JSON.parse(textResponse);
        setTimeTableData(data);
        return {data, message: ''};
      } else {
        console.error('No valid role found for fetching timetable');
      }
    } catch (error) {
      console.error('Error fetching timetable data', error);
    }
  }, [userId, year, monday]);
  useFocusEffect(
    useCallback(() => {
      fetchUserRole();
      fetchAdditionalData();
    }, [navigation]),
  );
  useEffect(() => {
    if (userId && year) {
      fetchTimeTable();
    }
  }, [userId, year, fetchTimeTable]);

  // const data = role == 'Student' ? sectionByStudent : sectionByTeacher;
  const data =
    role === 'Student'
      ? sectionByStudent
      : role === 'Parent'
      ? sectionByParent
      : sectionByTeacher;

  console.log('Role:', role);
  console.log('Data:', data);
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      {/* Hiển thị thông báo nếu đang tải dữ liệu */}
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={data}
          renderItem={({item}) =>
            renderFlatList({item, navigation, role, timeTableData})
          }
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
}

// function LogoutScreen({navigation}: MyProps) {
//   return (
//     <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
//       <Button onPress={() => handleLogout(navigation)} title="Đăng xuất" />
//     </View>
//   );
// }

const Drawer = createDrawerNavigator();

const HomeMain = ({navigation}: MyProps): React.JSX.Element => {
  const [loading, setLoading] = useState<boolean>(true);
  const [role, setRole] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchUserRole = async () => {
        try {
          const storedRole = await AsyncStorage.getItem('userRoles');
          if (storedRole) {
            const parsedRoles = JSON.parse(storedRole);
            setRole(parsedRoles[0]);
            console.log('User role:', parsedRoles[0]);
          } else {
            console.error('No user roles found in AsyncStorage');
          }
        } catch (error) {
          console.error('Error fetching user roles from AsyncStorage', error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserRole();
    }, [navigation]),
  );

  const handleLogoutPress = async () => {
    handleLogout(navigation);
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const commonScreens = (
    <>
      <Drawer.Screen
        name="E-School"
        component={HomeScreen}
        options={{
          title: 'E-School',
          drawerIcon: ({color, size}) => (
            <Image
              source={require('../assets/images/icons/Home.png')}
              style={{width: size, height: size, tintColor: color}}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{
          title: 'Thông tin cá nhân',
          drawerIcon: ({color, size}) => (
            <Image
              source={require('../assets/images/icons/person.png')}
              style={{width: size, height: size}}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Notification"
        component={Notification}
        options={{
          title: 'Thông báo',
          drawerIcon: ({color, size}) => (
            <Image
              source={require('../assets/images/icons/Notification.png')}
              style={{width: size, height: size}}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="WeeklyTimeTable"
        component={WeeklyTimeTableMain}
        options={{
          title: 'Thời khóa biểu',
          drawerIcon: ({color, size}) => (
            <Image
              source={require('../assets/images/icons/Calendar.png')}
              style={{width: size, height: size}}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Attendance"
        component={Attendance}
        options={{
          title: 'Điểm danh',
          drawerIcon: ({color, size}) => (
            <Image
              source={require('../assets/images/icons/Attendance.png')}
              style={{width: size, height: size}}
            />
          ),
        }}
      />
    </>
  );

  const studentScreens = (
    <>
      <Drawer.Screen
        name="Calculate"
        component={Calculate}
        options={{
          title: 'Tính điểm',
          drawerIcon: ({color, size}) => (
            <Image
              source={require('../assets/images/icons/Exam.png')}
              style={{width: size, height: size}}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="ScoreMain"
        component={ScoreMain}
        options={{
          title: 'Điểm',
          drawerIcon: ({color, size}) => (
            <Image
              source={require('../assets/images/icons/Point.png')}
              style={{width: size, height: size}}
            />
          ),
        }}
      />
    </>
  );

  const parentScreens = (
    <>
      <Drawer.Screen
        name="ScoreMain"
        component={ScoreMain}
        options={{
          title: 'Điểm',
          drawerIcon: ({color, size}) => (
            <Image
              source={require('../assets/images/icons/Point.png')}
              style={{width: size, height: size}}
            />
          ),
        }}
      />
    </>
  );

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar backgroundColor={'white'} barStyle={'dark-content'} />
      <Drawer.Navigator
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: colors.primaryColor,
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontSize: 25,
            fontWeight: 'bold',
          },
        }}>
        {commonScreens}
        {role === 'Student' && studentScreens}
        {role === 'Parent' && parentScreens}
        <Drawer.Screen
          name="Logout"
          component={View}
          options={{
            title: 'Đăng xuất',
            drawerIcon: ({color, size}) => (
              <Image
                source={require('../assets/images/icons/logout.png')}
                style={{width: size, height: size}}
              />
            ),
          }}
          listeners={{
            drawerItemPress: e => {
              e.preventDefault();
              handleLogoutPress();
            },
          }}
        />
      </Drawer.Navigator>
    </SafeAreaView>
  );
};

export default HomeMain;

const styles = StyleSheet.create({
  safeAreaView: {backgroundColor: 'white', flex: 1},
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    height: 60,
    backgroundColor: colors.primaryColor,
    elevation: 5,
    justifyContent: 'center',
    paddingLeft: 20,
  },
  item: {
    backgroundColor: '#fff',
    padding: 20,
    width: 160,
    height: 140,
    alignItems: 'center',
    // borderWidth: 0.5,
    color: 'black',
    margin: 10,
    borderRadius: 20,
    justifyContent: 'center',
    elevation: 5,
  },
  img: {
    width: 70,
    height: 70,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  sectionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainerStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textItem: {
    marginTop: 15,
    color: colors.primaryColor,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
// useEffect(() => {
//   const fetchUserRole = async () => {
//     try {
//       const storedRole = await AsyncStorage.getItem('userRoles');
//       if (storedRole) {
//         const parsedRoles = JSON.parse(storedRole);
//         setRole(parsedRoles[0]);
//         // console.log(parsedRoles[0]);
//         console.log('User role:', parsedRoles[0]);
//       } else {
//         console.error('No user roles found in AsyncStorage');
//       }
//     } catch (error) {
//       console.error('Error fetching user roles from AsyncStorage', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchUserRole();
// }, []);
// useFocusEffect(
//   useCallback(() => {
//     const fetchUserRole = async () => {
//       try {
//         const storedRole = await AsyncStorage.getItem('userRoles');
//         if (storedRole) {
//           const parsedRoles = JSON.parse(storedRole);
//           setRole(parsedRoles[0]);
//           console.log('User role:', parsedRoles[0]); // In ra vai trò đã được đặt
//         } else {
//           console.error('No user roles found in AsyncStorage');
//         }
//       } catch (error) {
//         console.error('Error fetching user roles from AsyncStorage', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserRole();
//     // fetchAdditionalData();
//   }, [navigation]), // Chạy lại khi navigation thay đổi
// );

// const renderFlatList = ({item}: {item: SectionType}) => (
//   <>
//     {renderSectionHeader({section: item})}
//     <FlatList
//       data={item.data}
//       renderItem={renderItem}
//       keyExtractor={item => item.id.toString()}
//       numColumns={item.data.length === 1 ? 1 : 2}
//       contentContainerStyle={styles.contentContainerStyle}
//     />
//   </>
// );

// function handleLogout(
//   navigation: StackNavigationProp<RootNavigationProps, 'Home'>,
// ) {
//   Alert.alert(
//     'Xác nhận',
//     'Bạn muốn đăng xuất phải không?',
//     [
//       {a
//         text: 'Không',
//         onPress: () => console.log('Không'),
//         style: 'cancel',
//       },
//       {
//         text: 'Có',
//         onPress: () => navigation.navigate('Login'), // Điều hướng đến màn hình đăng nhập
//       },
//     ],
//     {cancelable: false},
//   );
// }

// const renderSectionHeader = ({section: {title}}: {section: SectionType}) => (
//   <View style={styles.sectionContainer}>
//     <Text style={styles.sectionHeader}>{title}</Text>
//   </View>
// );
