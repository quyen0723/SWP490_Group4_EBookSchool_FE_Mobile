import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {RootNavigationProps} from './types';
import {colors} from '../assets/css/colors';
import {scoreByStudent} from '../mock/score';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DetailScoreFirstYearOneProps {
  navigation: StackNavigationProp<
    RootNavigationProps,
    'DetailScoreFirstYearOne'
  >;
  route: RouteProp<RootNavigationProps, 'DetailScoreFirstYearOne'>;
}

interface Score {
  key: string;
  value: number;
  semester: string;
}

interface Subject {
  subject: string;
  average: number;
  scores: Score[];
}

interface StudentScores {
  fullName: string;
  schoolYear: string;
  className: string;
  details: Subject[];
}

const DetailScoreFirstYearOne = ({
  navigation,
  route,
}: DetailScoreFirstYearOneProps) => {
  const {semesterId}: any = route.params;

  // Tìm kiếm thông tin của học kỳ có ID tương ứng
  const selectedSemester = scoreByStudent.data.find(
    semester => semester.id === semesterId,
  );

  const [studentScores, setStudentScores] = useState<StudentScores | null>(
    null,
  );
  const [studentScoresValue, setStudentScoresValue] =
    useState<StudentScores | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeTable = async (userId: string) => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const response = await fetch(
          `https://orbapi.click/api/Scores/ByStudentAllSubject?schoolYear=2023-2024&studentID=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        const data = await response.json();
        console.log('Data fetched from API:', JSON.stringify(data, null, 2));
        if (data.success) {
          data.data.details.forEach((subject: Subject) => {
            console.log(`Subject: ${subject.subject}`);
            if (subject.scores.length > 0) {
              subject.scores.forEach((score, index) => {
                console.log(`Score ${index}:`, JSON.stringify(score, null, 2));
              });
            } else {
              console.log(`Scores array for ${subject.subject} is empty`);
            }
          });
          setStudentScores(data.data);
          // setStudentScoresValue(data.data.details.scores);
        } else {
          console.error('Error:', data.message);
        }
      } catch (error) {
        console.error('Error fetching scores data', error);
      }
    };

    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
          // console.log('User ID fetched from AsyncStorage:', storedUserId);
          fetchTimeTable(storedUserId);
        } else {
          console.error('No user ID found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching user ID from AsyncStorage', error);
      }
    };

    fetchUserId();
  }, []);
  // console.log('AAAAAAAAAA', studentScores?.details.scores);
  return (
    <View style={styles.main}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            style={styles.imge}
            source={require('../assets/images/icons/Back.png')}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết điểm</Text>
        <View style={{flex: 1}} />
      </View>
      <View>
        <View style={styles.row}>
          <Text style={styles.semesterText}>{selectedSemester?.semester}</Text>
        </View>

        <View style={[styles.row, {paddingHorizontal: 20}]}>
          <Text style={[styles.semesterIdText, {fontWeight: 'normal'}]}>
            <Text style={[styles.semesterIdText, {fontWeight: 'bold'}]}>
              TBCM:{' '}
            </Text>
            {selectedSemester?.average}
          </Text>
          <Text style={[styles.semesterIdText, {fontWeight: 'normal'}]}>
            <Text style={[styles.semesterIdText, {fontWeight: 'bold'}]}>
              Hạnh kiểm:{' '}
            </Text>
            {selectedSemester?.conduct}
          </Text>
          <Text style={[styles.semesterIdText, {fontWeight: 'normal'}]}>
            <Text style={[styles.semesterIdText, {fontWeight: 'bold'}]}>
              Hạng:{' '}
            </Text>
            {selectedSemester?.rank}
          </Text>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}>
          {studentScores &&
            studentScores.details.map(
              (subjectScore: Subject, index: number) => (
                <View key={index} style={styles.subjectContainer}>
                  <Text style={styles.subjectText}>{subjectScore.subject}</Text>
                  {(() => {
                    // Tạo một đối tượng để lưu trữ các giá trị theo key
                    const groupedDetails: {[key: string]: number[]} = {};
                    subjectScore.scores.forEach(detail => {
                      if (!groupedDetails[detail.key]) {
                        groupedDetails[detail.key] = [];
                      }
                      groupedDetails[detail.key].push(detail.value);
                    });

                    // Chuyển đổi đối tượng thành một mảng để render
                    return Object.keys(groupedDetails).map(
                      (key, detailIndex) => (
                        <View key={detailIndex}>
                          <View style={styles.detailContainer}>
                            <Text style={styles.keyText}>{key}:</Text>
                            <Text style={styles.keyValueText}>
                              {groupedDetails[key].join('   ')}
                            </Text>
                          </View>
                          {detailIndex <
                            Object.keys(groupedDetails).length - 1 && (
                            <View style={styles.horizontalLine} />
                          )}
                        </View>
                      ),
                    );
                  })()}
                  {index < studentScores.details.length && (
                    <View style={styles.horizontalLine} />
                  )}
                  <View>
                    <Text style={styles.titleEvaluate}>Nhận xét:</Text>
                    <Text style={styles.titleEvaluateDetail}>
                      {selectedSemester?.note}
                    </Text>
                  </View>
                </View>
              ),
            )}
        </ScrollView>
      </View>
    </View>
  );
};

export default DetailScoreFirstYearOne;

const styles = StyleSheet.create({
  scrollView: {
    // flex: 1,
    maxHeight: '80%',
    marginBottom: 110,
  },
  scrollViewContent: {
    paddingTop: 16, // Add padding to avoid overlap with fixed content
  },
  titleEvaluateDetail: {
    color: 'black',
    paddingHorizontal: 10,
  },
  titleEvaluate: {
    color: 'black',
    fontWeight: '500',
    paddingHorizontal: 10,
  },
  keyValueText: {
    color: 'black',
    fontWeight: '500',
  },
  keyText: {
    color: 'black',
    fontWeight: '500',
  },
  horizontalLine: {
    height: 1,
    backgroundColor: '#999999',
    marginVertical: 8, // Điều chỉnh khoảng cách trên và dưới nếu cần
  },
  detailKey: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    flex: 3,
  },
  detailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    // your additional styles, if needed
  },
  imge: {
    width: 27,
    height: 27,
    tintColor: '#FFFFFF',
  },
  main: {
    backgroundColor: '#F4F5F4',
    flex: 1,
    width: '100%',
    color: 'black',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    backgroundColor: colors.primaryColor,
    elevation: 5,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 100,
    color: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  semesterText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    flex: 1,
    color: 'black',
  },
  semesterIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    flex: 1,
    color: 'black',
  },
  subjectContainer: {
    backgroundColor: colors.whiteColor,
    padding: 14,
    marginVertical: 5,
    borderRadius: 10,
    marginHorizontal: 20,
    elevation: 5,
  },
  subjectText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'black',
    paddingLeft: 10,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

{
  /* Hiển thị thông tin điểm của các môn học */
}
{
  /* {selectedSemester &&
          selectedSemester.scores.map((subjectScore, index) => (
            <View key={index} style={styles.subjectContainer}>
              <Text style={styles.subjectText}>{subjectScore.subject}</Text>
              {subjectScore.scoreDetail.map((detail, detailIndex) => (
                <View key={detailIndex} style={styles.detailContainer}>
                  <Text>{detail.key}:</Text>
                  <Text>{detail.value}</Text>
                </View>
              ))}
            </View>
          ))} */
}

// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   ScrollView,
// } from 'react-native';
// import {StackNavigationProp} from '@react-navigation/stack';
// import {RouteProp} from '@react-navigation/native';
// import {RootNavigationProps} from './types';
// import {colors} from '../assets/css/colors';
// import {scoreByStudent} from '../mock/score';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// interface DetailScoreFirstYearOneProps {
//   navigation: StackNavigationProp<
//     RootNavigationProps,
//     'DetailScoreFirstYearOne'
//   >;
//   route: RouteProp<RootNavigationProps, 'DetailScoreFirstYearOne'>;
// }

// const DetailScoreFirstYearOne = ({
//   navigation,
//   route,
// }: DetailScoreFirstYearOneProps) => {
//   const {semesterId}: any = route.params;

//   // Tìm kiếm thông tin của học kỳ có ID tương ứng
//   const selectedSemester = scoreByStudent.data.find(
//     semester => semester.id === semesterId,
//   );

//   const [scores, setScores] = useState<Items>({});

//   useEffect(() => {
//     const fetchTimeTable = async (userId: string) => {
//       try {
//         const accessToken = await AsyncStorage.getItem('accessToken');
//         const response = await fetch(
//           `https://orbapi.click/api/Scores/ByStudentAllSubject?schoolYear=2023-2024&studentID=${userId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//             },
//           },
//         );
//         const coreDetail = await response.json();
//         console.log('coreDetail:', coreDetail);
//         if (coreDetail.success) {
//           setWeeklyTimeTable(timeTableData.data);
//           setFromDatee(timeTableData.data.fromDate);
//           setToDatee(timeTableData.data.toDate);
//         } else {
//           // setError(timeTableData.message);
//         }
//         // processTimeTableData(timeTableData);
//       } catch (error) {
//         console.error('Error fetching timetable data', error);
//       }
//     };

//     const fetchUserId = async () => {
//       try {
//         const storedUserId = await AsyncStorage.getItem('userId');
//         if (storedUserId) {
//           setUserId(storedUserId);
//           // console.log('User ID fetched from AsyncStorage:', storedUserId);
//           fetchTimeTable(storedUserId);
//         } else {
//           console.error('No user ID found in AsyncStorage');
//         }
//       } catch (error) {
//         console.error('Error fetching user ID from AsyncStorage', error);
//       }
//     };

//     fetchUserId();
//   }, []);

//   return (
//     <View style={styles.main}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Image
//             style={styles.imge}
//             source={require('../assets/images/icons/Back.png')}
//           />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Chi tiết điểm</Text>
//         <View style={{flex: 1}} />
//       </View>
//       <View>
//         <View style={styles.row}>
//           <Text style={styles.semesterText}>{selectedSemester?.semester}</Text>
//         </View>

//         <View style={[styles.row, {paddingHorizontal: 20}]}>
//           <Text style={[styles.semesterIdText, {fontWeight: 'normal'}]}>
//             <Text style={[styles.semesterIdText, {fontWeight: 'bold'}]}>
//               TBCM:{' '}
//             </Text>
//             {selectedSemester?.average}
//           </Text>
//           <Text style={[styles.semesterIdText, {fontWeight: 'normal'}]}>
//             <Text style={[styles.semesterIdText, {fontWeight: 'bold'}]}>
//               Hạnh kiểm:{' '}
//             </Text>
//             {selectedSemester?.conduct}
//           </Text>
//           <Text style={[styles.semesterIdText, {fontWeight: 'normal'}]}>
//             <Text style={[styles.semesterIdText, {fontWeight: 'bold'}]}>
//               Hạng:{' '}
//             </Text>
//             {selectedSemester?.rank}
//           </Text>
//         </View>
//         <ScrollView
//           style={styles.scrollView}
//           contentContainerStyle={styles.scrollViewContent}>
//           {selectedSemester &&
//             selectedSemester.scores.map((subjectScore, index) => (
//               <View key={index} style={styles.subjectContainer}>
//                 <Text style={styles.subjectText}>{subjectScore.subject}</Text>
//                 {(() => {
//                   // Tạo một đối tượng để lưu trữ các giá trị theo key
//                   const groupedDetails: {[key: string]: number[]} = {};
//                   subjectScore.scoreDetail.forEach(detail => {
//                     if (!groupedDetails[detail.key]) {
//                       groupedDetails[detail.key] = [];
//                     }
//                     groupedDetails[detail.key].push(detail.value);
//                   });

//                   // Chuyển đổi đối tượng thành một mảng để render
//                   return Object.keys(groupedDetails).map((key, detailIndex) => (
//                     <View key={detailIndex}>
//                       <View style={styles.detailContainer}>
//                         <Text style={styles.keyText}>{key}:</Text>
//                         <Text style={styles.keyValueText}>
//                           {groupedDetails[key].join('   ')}
//                         </Text>
//                       </View>
//                       {detailIndex < Object.keys(groupedDetails).length - 1 && (
//                         <View style={styles.horizontalLine} />
//                       )}
//                     </View>
//                   ));
//                 })()}
//                 {index < selectedSemester.scores.length && (
//                   <View style={styles.horizontalLine} />
//                 )}
//                 <View>
//                   <Text style={styles.titleEvaluate}>Nhận xét:</Text>
//                   <Text style={styles.titleEvaluateDetail}>
//                     {selectedSemester?.note}
//                   </Text>
//                 </View>
//               </View>
//             ))}
//         </ScrollView>
//       </View>
//     </View>
//   );
// };

// export default DetailScoreFirstYearOne;

// const styles = StyleSheet.create({
//   scrollView: {
//     // flex: 1,
//     maxHeight: '80%',
//     marginBottom: 110,
//   },
//   scrollViewContent: {
//     paddingTop: 16, // Add padding to avoid overlap with fixed content
//   },
//   titleEvaluateDetail: {
//     color: 'black',
//     paddingHorizontal: 10,
//   },
//   titleEvaluate: {
//     color: 'black',
//     fontWeight: '500',
//     paddingHorizontal: 10,
//   },
//   keyValueText: {
//     color: 'black',
//     fontWeight: '500',
//   },
//   keyText: {
//     color: 'black',
//     fontWeight: '500',
//   },
//   horizontalLine: {
//     height: 1,
//     backgroundColor: '#999999',
//     marginVertical: 8, // Điều chỉnh khoảng cách trên và dưới nếu cần
//   },
//   detailKey: {
//     fontSize: 14,
//     fontWeight: '500',
//     flex: 1,
//   },
//   detailValue: {
//     fontSize: 14,
//     flex: 3,
//   },
//   detailContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 10,
//     // your additional styles, if needed
//   },
//   imge: {
//     width: 27,
//     height: 27,
//     tintColor: '#FFFFFF',
//   },
//   main: {
//     backgroundColor: '#F4F5F4',
//     flex: 1,
//     width: '100%',
//     color: 'black',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     height: 60,
//     backgroundColor: colors.primaryColor,
//     elevation: 5,
//     paddingHorizontal: 10,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginLeft: 100,
//     color: 'white',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   semesterText: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginVertical: 15,
//     flex: 1,
//     color: 'black',
//   },
//   semesterIdText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 10,
//     flex: 1,
//     color: 'black',
//   },
//   subjectContainer: {
//     backgroundColor: colors.whiteColor,
//     padding: 14,
//     marginVertical: 5,
//     borderRadius: 10,
//     marginHorizontal: 20,
//     elevation: 5,
//   },
//   subjectText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     color: 'black',
//     paddingLeft: 10,
//   },
//   detailText: {
//     fontSize: 14,
//     marginLeft: 10,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
// });
