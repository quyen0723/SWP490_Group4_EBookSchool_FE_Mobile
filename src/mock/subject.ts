interface ComponentPoint {
  id: number;
  name: string;
  scoreFactor: number;
  count: number;
}

interface Point {
  semester: string;
  componentPoints: ComponentPoint[];
}

interface LessonPlan {
  id: number;
  slot: number;
  title: string;
  description: string;
}

interface Subject {
  id: number;
  name: string;
  description: string;
  grade: string;
  points?: Point[];
  lessonPlans?: LessonPlan[];
}

const subject: {
  code: number;
  status: boolean;
  message: string;
  data: Subject;
} = {
  code: 200,
  status: true,
  message: 'ok',
  data: {
    id: 1,
    name: 'Toán',
    description: 'Môn toán khối 12',
    grade: 'Khối 12',
    points: [
      {
        semester: 'Học kì 1',
        componentPoints: [
          {
            id: 1,
            name: 'Kiểm tra miệng',
            scoreFactor: 1,
            count: 2,
          },
          {
            id: 2,
            name: 'Kiểm tra 15 phút',
            scoreFactor: 1,
            count: 2,
          },
          {
            id: 3,
            name: 'Kiểm tra 1 tiết',
            scoreFactor: 2,
            count: 1,
          },
          {
            id: 4,
            name: 'Kiểm tra cuối kì',
            scoreFactor: 2,
            count: 1,
          },
        ],
      },
      {
        semester: 'Học kì 2',
        componentPoints: [
          {
            id: 1,
            name: 'Kiểm tra miệng',
            scoreFactor: 1,
            count: 2,
          },
          {
            id: 2,
            name: 'Kiểm tra 15 phút',
            scoreFactor: 1,
            count: 2,
          },
          {
            id: 3,
            name: 'Kiểm tra 1 tiết',
            scoreFactor: 2,
            count: 1,
          },
          {
            id: 4,
            name: 'Kiểm tra cuối kì',
            scoreFactor: 2,
            count: 1,
          },
        ],
      },
    ],
    lessonPlans: [
      {
        id: 1,
        slot: 1,
        title: 'Nhập môn toán',
        description: 'Học cộng trừ nhân chia',
      },
      {
        id: 2,
        slot: 2,
        title: 'Nhập môn toán',
        description: 'Học cộng trừ nhân chia',
      },
      {
        id: 3,
        slot: 3,
        title: 'Nhập môn toán',
        description: 'Học cộng trừ nhân chia',
      },
      {
        id: 4,
        slot: 4,
        title: 'Nhập môn toán',
        description: 'Học cộng trừ nhân chia',
      },
      {
        id: 5,
        slot: 5,
        title: 'Nhập môn toán',
        description: 'Học cộng trừ nhân chia',
      },
      {
        id: 6,
        slot: 6,
        title: 'Nhập môn toán',
        description: 'Học cộng trừ nhân chia',
      },
      {
        id: 7,
        slot: 7,
        title: 'Nhập môn toán',
        description: 'Học cộng trừ nhân chia',
      },
      {
        id: 8,
        slot: 8,
        title: 'Nhập môn toán',
        description: 'Học cộng trừ nhân chia',
      },
      {
        id: 9,
        slot: 9,
        title: 'Nhập môn toán',
        description: 'Học cộng trừ nhân chia',
      },
    ],
  },
};

const subjects: {
  code: number;
  status: boolean;
  message: string;
  data: Subject[];
} = {
  code: 200,
  status: true,
  message: 'ok',
  data: [
    {
      id: 1,
      name: 'Toán',
      description: 'Môn toán khối 12',
      grade: 'Khối 12',
    },
    {
      id: 2,
      name: 'Ngữ Văn',
      description: 'Môn ngữ văn khối 12',
      grade: 'Khối 12',
    },
    {
      id: 3,
      name: 'Tiếng Anh',
      description: 'Môn tiếng anh khối 12',
      grade: 'Khối 12',
    },
  ],
};

export {subject, subjects};
