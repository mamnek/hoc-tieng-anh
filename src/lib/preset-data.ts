import { Word, WordSet } from './types';

export const presetWordSets: WordSet[] = [
  {
    id: 'ielts-business',
    name: 'Kinh doanh & Thương mại',
    examType: 'IELTS',
    category: 'Business',
    isPreset: true,
    wordCount: 20,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ielts-education',
    name: 'Giáo dục & Đào tạo',
    examType: 'IELTS',
    category: 'Education',
    isPreset: true,
    wordCount: 20,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ielts-environment',
    name: 'Môi trường & Thiên nhiên',
    examType: 'IELTS',
    category: 'Environment',
    isPreset: true,
    wordCount: 20,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ielts-health',
    name: 'Sức khỏe & Y tế',
    examType: 'IELTS',
    category: 'Health',
    isPreset: true,
    wordCount: 20,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ielts-technology',
    name: 'Công nghệ & Khoa học',
    examType: 'IELTS',
    category: 'Technology',
    isPreset: true,
    wordCount: 20,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'toeic-workplace',
    name: 'Nơi làm việc',
    examType: 'TOEIC',
    category: 'Workplace',
    isPreset: true,
    wordCount: 20,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'toeic-travel',
    name: 'Du lịch & Giao thông',
    examType: 'TOEIC',
    category: 'Travel',
    isPreset: true,
    wordCount: 20,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const presetWords: Word[] = [
  // IELTS BUSINESS
  {
    id: 'bus-1',
    wordSetId: 'ielts-business',
    term: 'entrepreneur',
    ipa: '/ˌɒn.trə.prəˈnɜːr/',
    meaningVi: 'doanh nhân, nhà khởi nghiệp',
    partOfSpeech: 'noun',
    exampleEn: 'He was a successful entrepreneur before entering politics.',
    exampleVi: 'Ông ấy là một doanh nhân thành đạt trước khi tham gia chính trị.'
  },
  {
    id: 'bus-2',
    wordSetId: 'ielts-business',
    term: 'revenue',
    ipa: '/ˈrev.ən.juː/',
    meaningVi: 'doanh thu',
    partOfSpeech: 'noun',
    exampleEn: 'Company revenue rose by 10% last year.',
    exampleVi: 'Doanh thu công ty đã tăng 10% vào năm ngoái.'
  },
  {
    id: 'bus-3',
    wordSetId: 'ielts-business',
    term: 'negotiate',
    ipa: '/nɪˈɡəʊ.ʃi.eɪt/',
    meaningVi: 'đàm phán, thương lượng',
    partOfSpeech: 'verb',
    exampleEn: 'The government has refused to negotiate with the strikers.',
    exampleVi: 'Chính phủ đã từ chối đàm phán với những người đình công.'
  },
  {
    id: 'bus-4',
    wordSetId: 'ielts-business',
    term: 'stakeholder',
    ipa: '/ˈsteɪk.həʊl.dər/',
    meaningVi: 'bên liên quan',
    partOfSpeech: 'noun',
    exampleEn: 'All stakeholders must be informed of the project changes.',
    exampleVi: 'Tất cả các bên liên quan phải được thông báo về những thay đổi của dự án.'
  },
  {
    id: 'bus-5',
    wordSetId: 'ielts-business',
    term: 'commodity',
    ipa: '/kəˈmɒd.ə.ti/',
    meaningVi: 'hàng hóa',
    partOfSpeech: 'noun',
    exampleEn: 'Oil is the country\'s most valuable commodity.',
    exampleVi: 'Dầu mỏ là hàng hóa có giá trị nhất của đất nước.'
  },
  {
    id: 'bus-6',
    wordSetId: 'ielts-business',
    term: 'budget',
    ipa: '/ˈbʌdʒ.ɪt/',
    meaningVi: 'ngân sách',
    partOfSpeech: 'noun',
    exampleEn: 'The project was completed on time and within budget.',
    exampleVi: 'Dự án được hoàn thành đúng thời hạn và trong phạm vi ngân sách.'
  },
  {
    id: 'bus-7',
    wordSetId: 'ielts-business',
    term: 'merger',
    ipa: '/ˈmɜː.dʒər/',
    meaningVi: 'sự sáp nhập',
    partOfSpeech: 'noun',
    exampleEn: 'The merger between the two companies was announced yesterday.',
    exampleVi: 'Sự sáp nhập giữa hai công ty đã được công bố vào ngày hôm qua.'
  },
  {
    id: 'bus-8',
    wordSetId: 'ielts-business',
    term: 'bankrupt',
    ipa: '/ˈbæŋk.rʌpt/',
    meaningVi: 'phá sản',
    partOfSpeech: 'adjective',
    exampleEn: 'The company went bankrupt after losing its major clients.',
    exampleVi: 'Công ty đã phá sản sau khi mất các khách hàng lớn.'
  },
  {
    id: 'bus-9',
    wordSetId: 'ielts-business',
    term: 'invoice',
    ipa: '/ˈɪn.vɔɪs/',
    meaningVi: 'hóa đơn',
    partOfSpeech: 'noun',
    exampleEn: 'Please pay the invoice within 30 days.',
    exampleVi: 'Vui lòng thanh toán hóa đơn trong vòng 30 ngày.'
  },
  {
    id: 'bus-10',
    wordSetId: 'ielts-business',
    term: 'subsidy',
    ipa: '/ˈsʌb.sə.di/',
    meaningVi: 'trợ cấp',
    partOfSpeech: 'noun',
    exampleEn: 'The government provides a subsidy to farmers.',
    exampleVi: 'Chính phủ cung cấp trợ cấp cho nông dân.'
  },
  {
    id: 'bus-11',
    wordSetId: 'ielts-business',
    term: 'franchise',
    ipa: '/ˈfræn.tʃaɪz/',
    meaningVi: 'nhượng quyền',
    partOfSpeech: 'noun',
    exampleEn: 'She bought a fast-food franchise in the city center.',
    exampleVi: 'Cô ấy đã mua một nhượng quyền thức ăn nhanh ở trung tâm thành phố.'
  },
  {
    id: 'bus-12',
    wordSetId: 'ielts-business',
    term: 'fluctuate',
    ipa: '/ˈflʌk.tʃu.eɪt/',
    meaningVi: 'dao động',
    partOfSpeech: 'verb',
    exampleEn: 'Vegetable prices fluctuate according to the season.',
    exampleVi: 'Giá rau củ dao động theo mùa.'
  },
  {
    id: 'bus-13',
    wordSetId: 'ielts-business',
    term: 'dividend',
    ipa: '/ˈdɪv.ɪ.dend/',
    meaningVi: 'cổ tức',
    partOfSpeech: 'noun',
    exampleEn: 'Shareholders will receive a dividend at the end of the year.',
    exampleVi: 'Cổ đông sẽ nhận được cổ tức vào cuối năm.'
  },
  {
    id: 'bus-14',
    wordSetId: 'ielts-business',
    term: 'turnover',
    ipa: '/ˈtɜːn.əʊ.vər/',
    meaningVi: 'doanh số',
    partOfSpeech: 'noun',
    exampleEn: 'The business has an annual turnover of $2 million.',
    exampleVi: 'Doanh nghiệp có doanh số hàng năm là 2 triệu USD.'
  },
  {
    id: 'bus-15',
    wordSetId: 'ielts-business',
    term: 'outsource',
    ipa: '/ˈaʊt.sɔːrs/',
    meaningVi: 'thuê ngoài',
    partOfSpeech: 'verb',
    exampleEn: 'Many companies outsource their IT operations to reduce costs.',
    exampleVi: 'Nhiều công ty thuê ngoài hoạt động CNTT của họ để giảm chi phí.'
  },
  {
    id: 'bus-16',
    wordSetId: 'ielts-business',
    term: 'monopoly',
    ipa: '/məˈnɒp.əl.i/',
    meaningVi: 'độc quyền',
    partOfSpeech: 'noun',
    exampleEn: 'The state has a monopoly on the tobacco industry.',
    exampleVi: 'Nhà nước có sự độc quyền đối với ngành công nghiệp thuốc lá.'
  },
  {
    id: 'bus-17',
    wordSetId: 'ielts-business',
    term: 'tariff',
    ipa: '/ˈtær.ɪf/',
    meaningVi: 'thuế quan',
    partOfSpeech: 'noun',
    exampleEn: 'The government imposed a tariff on imported steel.',
    exampleVi: 'Chính phủ đã áp đặt thuế quan đối với thép nhập khẩu.'
  },
  {
    id: 'bus-18',
    wordSetId: 'ielts-business',
    term: 'inventory',
    ipa: '/ˈɪn.vən.tər.i/',
    meaningVi: 'hàng tồn kho',
    partOfSpeech: 'noun',
    exampleEn: 'Our inventory of used cars is the best in town.',
    exampleVi: 'Hàng tồn kho xe cũ của chúng tôi là tốt nhất trong thị trấn.'
  },
  {
    id: 'bus-19',
    wordSetId: 'ielts-business',
    term: 'acquisition',
    ipa: '/ˌæk.wɪˈzɪʃ.ən/',
    meaningVi: 'sự mua lại',
    partOfSpeech: 'noun',
    exampleEn: 'The acquisition of the smaller company was completed yesterday.',
    exampleVi: 'Việc mua lại công ty nhỏ hơn đã hoàn tất ngày hôm qua.'
  },
  {
    id: 'bus-20',
    wordSetId: 'ielts-business',
    term: 'surplus',
    ipa: '/ˈsɜː.pləs/',
    meaningVi: 'thặng dư',
    partOfSpeech: 'noun',
    exampleEn: 'The country has a trade surplus of $5 billion.',
    exampleVi: 'Quốc gia này có thặng dư thương mại là 5 tỷ đô la.'
  },

  // IELTS EDUCATION
  {
    id: 'edu-1',
    wordSetId: 'ielts-education',
    term: 'curriculum',
    ipa: '/kəˈrɪk.jə.ləm/',
    meaningVi: 'chương trình giảng dạy',
    partOfSpeech: 'noun',
    exampleEn: 'Math is a core subject in the national curriculum.',
    exampleVi: 'Toán học là một môn học cốt lõi trong chương trình giảng dạy quốc gia.'
  },
  {
    id: 'edu-2',
    wordSetId: 'ielts-education',
    term: 'scholarship',
    ipa: '/ˈskɒl.ə.ʃɪp/',
    meaningVi: 'học bổng',
    partOfSpeech: 'noun',
    exampleEn: 'He won a scholarship to study at Harvard University.',
    exampleVi: 'Anh ấy đã giành được một học bổng để học tại Đại học Harvard.'
  },
  {
    id: 'edu-3',
    wordSetId: 'ielts-education',
    term: 'assessment',
    ipa: '/əˈses.mənt/',
    meaningVi: 'đánh giá',
    partOfSpeech: 'noun',
    exampleEn: 'Continuous assessment is used instead of traditional exams.',
    exampleVi: 'Đánh giá liên tục được sử dụng thay cho các kỳ thi truyền thống.'
  },
  {
    id: 'edu-4',
    wordSetId: 'ielts-education',
    term: 'literacy',
    ipa: '/ˈlɪt.ər.ə.si/',
    meaningVi: 'sự biết đọc biết viết',
    partOfSpeech: 'noun',
    exampleEn: 'The government aims to improve adult literacy in rural areas.',
    exampleVi: 'Chính phủ nhằm mục tiêu cải thiện khả năng đọc viết của người lớn ở khu vực nông thôn.'
  },
  {
    id: 'edu-5',
    wordSetId: 'ielts-education',
    term: 'pedagogy',
    ipa: '/ˈped.ə.ɡɒdʒ.i/',
    meaningVi: 'phương pháp sư phạm',
    partOfSpeech: 'noun',
    exampleEn: 'Her research focuses on modern teaching pedagogy.',
    exampleVi: 'Nghiên cứu của cô ấy tập trung vào phương pháp sư phạm giảng dạy hiện đại.'
  },
  {
    id: 'edu-6',
    wordSetId: 'ielts-education',
    term: 'dissertation',
    ipa: '/ˌdɪs.əˈteɪ.ʃən/',
    meaningVi: 'luận văn',
    partOfSpeech: 'noun',
    exampleEn: 'She is writing her doctoral dissertation on climate change.',
    exampleVi: 'Cô ấy đang viết luận án tiến sĩ về biến đổi khí hậu.'
  },
  {
    id: 'edu-7',
    wordSetId: 'ielts-education',
    term: 'vocational',
    ipa: '/vəʊˈkeɪ.ʃən.əl/',
    meaningVi: 'thuộc nghề nghiệp',
    partOfSpeech: 'adjective',
    exampleEn: 'Vocational training prepares students for specific careers.',
    exampleVi: 'Đào tạo nghề chuẩn bị cho học sinh cho những nghề nghiệp cụ thể.'
  },
  {
    id: 'edu-8',
    wordSetId: 'ielts-education',
    term: 'seminar',
    ipa: '/ˈsem.ɪ.nɑːr/',
    meaningVi: 'hội thảo',
    partOfSpeech: 'noun',
    exampleEn: 'I attended a seminar on digital marketing last week.',
    exampleVi: 'Tôi đã tham dự một cuộc hội thảo về tiếp thị kỹ thuật số vào tuần trước.'
  },
  {
    id: 'edu-9',
    wordSetId: 'ielts-education',
    term: 'compulsory',
    ipa: '/kəmˈpʌl.sər.i/',
    meaningVi: 'bắt buộc',
    partOfSpeech: 'adjective',
    exampleEn: 'English is a compulsory subject in most Vietnamese schools.',
    exampleVi: 'Tiếng Anh là môn học bắt buộc ở hầu hết các trường học Việt Nam.'
  },
  {
    id: 'edu-10',
    wordSetId: 'ielts-education',
    term: 'plagiarism',
    ipa: '/ˈpleɪ.dʒər.ɪ.zəm/',
    meaningVi: 'đạo văn',
    partOfSpeech: 'noun',
    exampleEn: 'Students caught committing plagiarism will fail the course.',
    exampleVi: 'Sinh viên bị bắt quả tang đạo văn sẽ bị rớt môn.'
  },
  {
    id: 'edu-11',
    wordSetId: 'ielts-education',
    term: 'enroll',
    ipa: '/ɪnˈrəʊl/',
    meaningVi: 'ghi danh, đăng ký',
    partOfSpeech: 'verb',
    exampleEn: 'She decided to enroll in a photography class.',
    exampleVi: 'Cô ấy quyết định đăng ký vào một lớp nhiếp ảnh.'
  },
  {
    id: 'edu-12',
    wordSetId: 'ielts-education',
    term: 'syllabus',
    ipa: '/ˈsɪl.ə.bəs/',
    meaningVi: 'đề cương môn học',
    partOfSpeech: 'noun',
    exampleEn: 'The syllabus outlines all the topics we will cover this semester.',
    exampleVi: 'Đề cương môn học phác thảo tất cả các chủ đề chúng ta sẽ học trong học kỳ này.'
  },
  {
    id: 'edu-13',
    wordSetId: 'ielts-education',
    term: 'undergraduate',
    ipa: '/ˌʌn.dəˈɡrædʒ.u.ət/',
    meaningVi: 'sinh viên đại học',
    partOfSpeech: 'noun',
    exampleEn: 'The university has over 10,000 undergraduate students.',
    exampleVi: 'Trường đại học có hơn 10.000 sinh viên đại học.'
  },
  {
    id: 'edu-14',
    wordSetId: 'ielts-education',
    term: 'tuition',
    ipa: '/tjuˈɪʃ.ən/',
    meaningVi: 'học phí',
    partOfSpeech: 'noun',
    exampleEn: 'Many students have to take out loans to pay their tuition.',
    exampleVi: 'Nhiều sinh viên phải vay tiền để trả học phí.'
  },
  {
    id: 'edu-15',
    wordSetId: 'ielts-education',
    term: 'extracurricular',
    ipa: '/ˌek.strə.kəˈrɪk.jə.lər/',
    meaningVi: 'ngoại khóa',
    partOfSpeech: 'adjective',
    exampleEn: 'He participates in many extracurricular activities, like sports and music.',
    exampleVi: 'Anh ấy tham gia nhiều hoạt động ngoại khóa, như thể thao và âm nhạc.'
  },
  {
    id: 'edu-16',
    wordSetId: 'ielts-education',
    term: 'proficiency',
    ipa: '/prəˈfɪʃ.ən.si/',
    meaningVi: 'sự thành thạo',
    partOfSpeech: 'noun',
    exampleEn: 'The job requires a high level of proficiency in English.',
    exampleVi: 'Công việc yêu cầu mức độ thành thạo tiếng Anh cao.'
  },
  {
    id: 'edu-17',
    wordSetId: 'ielts-education',
    term: 'collaborate',
    ipa: '/kəˈlæb.ə.reɪt/',
    meaningVi: 'hợp tác',
    partOfSpeech: 'verb',
    exampleEn: 'Students are encouraged to collaborate on group projects.',
    exampleVi: 'Học sinh được khuyến khích hợp tác trong các dự án nhóm.'
  },
  {
    id: 'edu-18',
    wordSetId: 'ielts-education',
    term: 'cognitive',
    ipa: '/ˈkɒɡ.nə.tɪv/',
    meaningVi: 'thuộc nhận thức',
    partOfSpeech: 'adjective',
    exampleEn: 'Puzzles can help improve cognitive development in children.',
    exampleVi: 'Câu đố có thể giúp cải thiện sự phát triển nhận thức ở trẻ em.'
  },
  {
    id: 'edu-19',
    wordSetId: 'ielts-education',
    term: 'inclusive',
    ipa: '/ɪnˈkluː.sɪv/',
    meaningVi: 'bao gồm, hòa nhập',
    partOfSpeech: 'adjective',
    exampleEn: 'We strive to create an inclusive classroom environment for all students.',
    exampleVi: 'Chúng tôi nỗ lực tạo ra một môi trường lớp học hòa nhập cho tất cả học sinh.'
  },
  {
    id: 'edu-20',
    wordSetId: 'ielts-education',
    term: 'mentor',
    ipa: '/ˈmen.tɔːr/',
    meaningVi: 'người hướng dẫn',
    partOfSpeech: 'noun',
    exampleEn: 'He acted as a mentor to young researchers in the lab.',
    exampleVi: 'Ông đóng vai trò là người cố vấn cho các nhà nghiên cứu trẻ trong phòng thí nghiệm.'
  },

  // IELTS ENVIRONMENT
  {
    id: 'env-1',
    wordSetId: 'ielts-environment',
    term: 'biodiversity',
    ipa: '/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/',
    meaningVi: 'sự đa dạng sinh học',
    partOfSpeech: 'noun',
    exampleEn: 'The new law aims to protect the area\'s rich biodiversity.',
    exampleVi: 'Luật mới nhằm bảo vệ sự đa dạng sinh học phong phú của khu vực.'
  },
  {
    id: 'env-2',
    wordSetId: 'ielts-environment',
    term: 'deforestation',
    ipa: '/diːˌfɒr.ɪˈsteɪ.ʃən/',
    meaningVi: 'nạn phá rừng',
    partOfSpeech: 'noun',
    exampleEn: 'Deforestation is causing the extinction of many species.',
    exampleVi: 'Nạn phá rừng đang gây ra sự tuyệt chủng của nhiều loài.'
  },
  {
    id: 'env-3',
    wordSetId: 'ielts-environment',
    term: 'ecosystem',
    ipa: '/ˈiː.kəʊˌsɪs.təm/',
    meaningVi: 'hệ sinh thái',
    partOfSpeech: 'noun',
    exampleEn: 'Pollution can have disastrous effects on the delicate ecosystem.',
    exampleVi: 'Ô nhiễm có thể có những tác động thảm khốc đối với hệ sinh thái mỏng manh.'
  },
  {
    id: 'env-4',
    wordSetId: 'ielts-environment',
    term: 'emission',
    ipa: '/ɪˈmɪʃ.ən/',
    meaningVi: 'khí thải',
    partOfSpeech: 'noun',
    exampleEn: 'Governments are trying to reduce greenhouse gas emissions.',
    exampleVi: 'Các chính phủ đang cố gắng giảm lượng khí thải nhà kính.'
  },
  {
    id: 'env-5',
    wordSetId: 'ielts-environment',
    term: 'sustainability',
    ipa: '/səˌsteɪ.nəˈbɪl.ə.ti/',
    meaningVi: 'sự bền vững',
    partOfSpeech: 'noun',
    exampleEn: 'The company is committed to environmental sustainability.',
    exampleVi: 'Công ty cam kết về tính bền vững của môi trường.'
  },
  {
    id: 'env-6',
    wordSetId: 'ielts-environment',
    term: 'renewable',
    ipa: '/rɪˈnjuː.ə.bəl/',
    meaningVi: 'có thể tái tạo',
    partOfSpeech: 'adjective',
    exampleEn: 'Wind and solar are popular sources of renewable energy.',
    exampleVi: 'Gió và năng lượng mặt trời là những nguồn năng lượng tái tạo phổ biến.'
  },
  {
    id: 'env-7',
    wordSetId: 'ielts-environment',
    term: 'pollution',
    ipa: '/pəˈluː.ʃən/',
    meaningVi: 'sự ô nhiễm',
    partOfSpeech: 'noun',
    exampleEn: 'Air pollution is a severe problem in many large cities.',
    exampleVi: 'Ô nhiễm không khí là một vấn đề nghiêm trọng ở nhiều thành phố lớn.'
  },
  {
    id: 'env-8',
    wordSetId: 'ielts-environment',
    term: 'conservation',
    ipa: '/ˌkɒn.səˈveɪ.ʃən/',
    meaningVi: 'sự bảo tồn',
    partOfSpeech: 'noun',
    exampleEn: 'Wildlife conservation is essential to protect endangered species.',
    exampleVi: 'Bảo tồn động vật hoang dã là điều cần thiết để bảo vệ các loài có nguy cơ tuyệt chủng.'
  },
  {
    id: 'env-9',
    wordSetId: 'ielts-environment',
    term: 'erosion',
    ipa: '/ɪˈrəʊ.ʒən/',
    meaningVi: 'sự xói mòn',
    partOfSpeech: 'noun',
    exampleEn: 'Tree planting is one way to prevent soil erosion.',
    exampleVi: 'Trồng cây là một cách để ngăn ngừa xói mòn đất.'
  },
  {
    id: 'env-10',
    wordSetId: 'ielts-environment',
    term: 'habitat',
    ipa: '/ˈhæb.ɪ.tæt/',
    meaningVi: 'môi trường sống',
    partOfSpeech: 'noun',
    exampleEn: 'The panda\'s natural habitat is bamboo forests in China.',
    exampleVi: 'Môi trường sống tự nhiên của gấu trúc là rừng tre ở Trung Quốc.'
  },
  {
    id: 'env-11',
    wordSetId: 'ielts-environment',
    term: 'glacier',
    ipa: '/ˈɡlæs.i.ər/',
    meaningVi: 'sông băng',
    partOfSpeech: 'noun',
    exampleEn: 'Global warming is causing glaciers to melt rapidly.',
    exampleVi: 'Sự nóng lên toàn cầu đang làm cho các sông băng tan chảy nhanh chóng.'
  },
  {
    id: 'env-12',
    wordSetId: 'ielts-environment',
    term: 'drought',
    ipa: '/draʊt/',
    meaningVi: 'hạn hán',
    partOfSpeech: 'noun',
    exampleEn: 'The severe drought has ruined many crops this year.',
    exampleVi: 'Trận hạn hán nghiêm trọng đã phá hủy nhiều mùa màng năm nay.'
  },
  {
    id: 'env-13',
    wordSetId: 'ielts-environment',
    term: 'endangered',
    ipa: '/ɪnˈdeɪn.dʒəd/',
    meaningVi: 'có nguy cơ tuyệt chủng',
    partOfSpeech: 'adjective',
    exampleEn: 'The sea turtle is an endangered species.',
    exampleVi: 'Rùa biển là một loài có nguy cơ tuyệt chủng.'
  },
  {
    id: 'env-14',
    wordSetId: 'ielts-environment',
    term: 'recycle',
    ipa: '/ˌriːˈsaɪ.kəl/',
    meaningVi: 'tái chế',
    partOfSpeech: 'verb',
    exampleEn: 'We should recycle glass and plastic bottles to reduce waste.',
    exampleVi: 'Chúng ta nên tái chế chai thủy tinh và nhựa để giảm rác thải.'
  },
  {
    id: 'env-15',
    wordSetId: 'ielts-environment',
    term: 'ozone',
    ipa: '/ˈəʊ.zəʊn/',
    meaningVi: 'khí ô-zôn',
    partOfSpeech: 'noun',
    exampleEn: 'The ozone layer protects us from the sun\'s harmful rays.',
    exampleVi: 'Tầng ô-zôn bảo vệ chúng ta khỏi các tia có hại của mặt trời.'
  },
  {
    id: 'env-16',
    wordSetId: 'ielts-environment',
    term: 'contaminate',
    ipa: '/kənˈtæm.ɪ.neɪt/',
    meaningVi: 'làm ô nhiễm',
    partOfSpeech: 'verb',
    exampleEn: 'Industrial waste has contaminated the river.',
    exampleVi: 'Chất thải công nghiệp đã làm ô nhiễm dòng sông.'
  },
  {
    id: 'env-17',
    wordSetId: 'ielts-environment',
    term: 'flora',
    ipa: '/ˈflɔː.rə/',
    meaningVi: 'hệ thực vật',
    partOfSpeech: 'noun',
    exampleEn: 'The island has a unique flora found nowhere else.',
    exampleVi: 'Hòn đảo có một hệ thực vật độc đáo không tìm thấy ở nơi nào khác.'
  },
  {
    id: 'env-18',
    wordSetId: 'ielts-environment',
    term: 'fauna',
    ipa: '/ˈfɔː.nə/',
    meaningVi: 'hệ động vật',
    partOfSpeech: 'noun',
    exampleEn: 'Studying the local fauna helps scientists understand the ecosystem.',
    exampleVi: 'Việc nghiên cứu hệ động vật địa phương giúp các nhà khoa học hiểu được hệ sinh thái.'
  },
  {
    id: 'env-19',
    wordSetId: 'ielts-environment',
    term: 'poaching',
    ipa: '/ˈpəʊ.tʃɪŋ/',
    meaningVi: 'săn trộm',
    partOfSpeech: 'noun',
    exampleEn: 'Poaching is a major threat to elephant populations.',
    exampleVi: 'Săn trộm là mối đe dọa lớn đối với quần thể voi.'
  },
  {
    id: 'env-20',
    wordSetId: 'ielts-environment',
    term: 'atmosphere',
    ipa: '/ˈæt.mə.sfɪər/',
    meaningVi: 'khí quyển',
    partOfSpeech: 'noun',
    exampleEn: 'Carbon dioxide is released into the atmosphere by burning fossil fuels.',
    exampleVi: 'Carbon dioxide được thải vào bầu khí quyển do việc đốt nhiên liệu hóa thạch.'
  },

  // IELTS HEALTH
  {
    id: 'hea-1',
    wordSetId: 'ielts-health',
    term: 'diagnosis',
    ipa: '/ˌdaɪ.əɡˈnəʊ.sɪs/',
    meaningVi: 'sự chẩn đoán',
    partOfSpeech: 'noun',
    exampleEn: 'Early diagnosis of the disease is crucial for effective treatment.',
    exampleVi: 'Chẩn đoán sớm bệnh là rất quan trọng để điều trị hiệu quả.'
  },
  {
    id: 'hea-2',
    wordSetId: 'ielts-health',
    term: 'symptom',
    ipa: '/ˈsɪmp.təm/',
    meaningVi: 'triệu chứng',
    partOfSpeech: 'noun',
    exampleEn: 'A high fever is a common symptom of the flu.',
    exampleVi: 'Sốt cao là một triệu chứng phổ biến của bệnh cúm.'
  },
  {
    id: 'hea-3',
    wordSetId: 'ielts-health',
    term: 'therapy',
    ipa: '/ˈθer.ə.pi/',
    meaningVi: 'liệu pháp, trị liệu',
    partOfSpeech: 'noun',
    exampleEn: 'Physical therapy helped him walk again after the accident.',
    exampleVi: 'Vật lý trị liệu đã giúp anh ấy đi lại được sau vụ tai nạn.'
  },
  {
    id: 'hea-4',
    wordSetId: 'ielts-health',
    term: 'chronic',
    ipa: '/ˈkrɒn.ɪk/',
    meaningVi: 'mãn tính',
    partOfSpeech: 'adjective',
    exampleEn: 'She suffers from chronic back pain.',
    exampleVi: 'Cô ấy bị đau lưng mãn tính.'
  },
  {
    id: 'hea-5',
    wordSetId: 'ielts-health',
    term: 'epidemic',
    ipa: '/ˌep.ɪˈdem.ɪk/',
    meaningVi: 'dịch bệnh',
    partOfSpeech: 'noun',
    exampleEn: 'The city was hit by a terrible flu epidemic.',
    exampleVi: 'Thành phố đã bị tấn công bởi một dịch cúm khủng khiếp.'
  },
  {
    id: 'hea-6',
    wordSetId: 'ielts-health',
    term: 'nutrition',
    ipa: '/njuːˈtrɪʃ.ən/',
    meaningVi: 'dinh dưỡng',
    partOfSpeech: 'noun',
    exampleEn: 'Good nutrition is essential for a growing child.',
    exampleVi: 'Dinh dưỡng tốt là cần thiết cho một đứa trẻ đang lớn.'
  },
  {
    id: 'hea-7',
    wordSetId: 'ielts-health',
    term: 'obesity',
    ipa: '/əʊˈbiː.sə.ti/',
    meaningVi: 'béo phì',
    partOfSpeech: 'noun',
    exampleEn: 'Childhood obesity is a growing problem in many countries.',
    exampleVi: 'Béo phì ở trẻ em là một vấn đề ngày càng gia tăng ở nhiều quốc gia.'
  },
  {
    id: 'hea-8',
    wordSetId: 'ielts-health',
    term: 'prescription',
    ipa: '/prɪˈskrɪp.ʃən/',
    meaningVi: 'đơn thuốc',
    partOfSpeech: 'noun',
    exampleEn: 'These drugs are only available on prescription.',
    exampleVi: 'Những loại thuốc này chỉ có sẵn theo đơn.'
  },
  {
    id: 'hea-9',
    wordSetId: 'ielts-health',
    term: 'rehabilitation',
    ipa: '/ˌriː.həˌbɪl.ɪˈteɪ.ʃən/',
    meaningVi: 'sự phục hồi chức năng',
    partOfSpeech: 'noun',
    exampleEn: 'He is undergoing rehabilitation after his knee surgery.',
    exampleVi: 'Anh ấy đang trải qua phục hồi chức năng sau ca phẫu thuật đầu gối.'
  },
  {
    id: 'hea-10',
    wordSetId: 'ielts-health',
    term: 'vaccine',
    ipa: '/ˈvæk.siːn/',
    meaningVi: 'vắc-xin',
    partOfSpeech: 'noun',
    exampleEn: 'Scientists are working hard to develop a new vaccine.',
    exampleVi: 'Các nhà khoa học đang làm việc chăm chỉ để phát triển một loại vắc-xin mới.'
  },
  {
    id: 'hea-11',
    wordSetId: 'ielts-health',
    term: 'antibody',
    ipa: '/ˈæn.tiˌbɒd.i/',
    meaningVi: 'kháng thể',
    partOfSpeech: 'noun',
    exampleEn: 'Antibodies help the body fight off infections.',
    exampleVi: 'Kháng thể giúp cơ thể chống lại sự nhiễm trùng.'
  },
  {
    id: 'hea-12',
    wordSetId: 'ielts-health',
    term: 'hygiene',
    ipa: '/ˈhaɪ.dʒiːn/',
    meaningVi: 'vệ sinh',
    partOfSpeech: 'noun',
    exampleEn: 'Good dental hygiene prevents tooth decay.',
    exampleVi: 'Vệ sinh răng miệng tốt ngăn ngừa sâu răng.'
  },
  {
    id: 'hea-13',
    wordSetId: 'ielts-health',
    term: 'metabolism',
    ipa: '/məˈtæb.əl.ɪ.zəm/',
    meaningVi: 'sự trao đổi chất',
    partOfSpeech: 'noun',
    exampleEn: 'Exercise can speed up your metabolism.',
    exampleVi: 'Tập thể dục có thể tăng tốc độ trao đổi chất của bạn.'
  },
  {
    id: 'hea-14',
    wordSetId: 'ielts-health',
    term: 'allergy',
    ipa: '/ˈæl.ə.dʒi/',
    meaningVi: 'dị ứng',
    partOfSpeech: 'noun',
    exampleEn: 'He has a severe peanut allergy.',
    exampleVi: 'Anh ấy bị dị ứng đậu phộng nghiêm trọng.'
  },
  {
    id: 'hea-15',
    wordSetId: 'ielts-health',
    term: 'surgery',
    ipa: '/ˈsɜː.dʒər.i/',
    meaningVi: 'phẫu thuật',
    partOfSpeech: 'noun',
    exampleEn: 'The patient requires immediate open-heart surgery.',
    exampleVi: 'Bệnh nhân yêu cầu phẫu thuật tim hở ngay lập tức.'
  },
  {
    id: 'hea-16',
    wordSetId: 'ielts-health',
    term: 'immune',
    ipa: '/ɪˈmjuːn/',
    meaningVi: 'miễn dịch',
    partOfSpeech: 'adjective',
    exampleEn: 'A healthy diet strengthens your immune system.',
    exampleVi: 'Một chế độ ăn uống lành mạnh củng cố hệ thống miễn dịch của bạn.'
  },
  {
    id: 'hea-17',
    wordSetId: 'ielts-health',
    term: 'contagious',
    ipa: '/kənˈteɪ.dʒəs/',
    meaningVi: 'lây nhiễm',
    partOfSpeech: 'adjective',
    exampleEn: 'The infection is highly contagious, so stay away from others.',
    exampleVi: 'Sự lây nhiễm rất dễ lây lan, vì vậy hãy tránh xa người khác.'
  },
  {
    id: 'hea-18',
    wordSetId: 'ielts-health',
    term: 'sedentary',
    ipa: '/ˈsed.ən.tər.i/',
    meaningVi: 'ít vận động',
    partOfSpeech: 'adjective',
    exampleEn: 'A sedentary lifestyle can lead to health problems.',
    exampleVi: 'Lối sống ít vận động có thể dẫn đến các vấn đề sức khỏe.'
  },
  {
    id: 'hea-19',
    wordSetId: 'ielts-health',
    term: 'supplement',
    ipa: '/ˈsʌp.lɪ.mənt/',
    meaningVi: 'chất bổ sung',
    partOfSpeech: 'noun',
    exampleEn: 'Some people take vitamin supplements every day.',
    exampleVi: 'Một số người uống thuốc bổ sung vitamin mỗi ngày.'
  },
  {
    id: 'hea-20',
    wordSetId: 'ielts-health',
    term: 'insomnia',
    ipa: '/ɪnˈsɒm.ni.ə/',
    meaningVi: 'chứng mất ngủ',
    partOfSpeech: 'noun',
    exampleEn: 'Stress at work is causing her severe insomnia.',
    exampleVi: 'Căng thẳng trong công việc đang khiến cô ấy bị mất ngủ nghiêm trọng.'
  },

  // IELTS TECHNOLOGY
  {
    id: 'tech-1',
    wordSetId: 'ielts-technology',
    term: 'algorithm',
    ipa: '/ˈæl.ɡə.rɪ.ðəm/',
    meaningVi: 'thuật toán',
    partOfSpeech: 'noun',
    exampleEn: 'Social media platforms use an algorithm to show you relevant content.',
    exampleVi: 'Các nền tảng truyền thông xã hội sử dụng thuật toán để hiển thị cho bạn nội dung phù hợp.'
  },
  {
    id: 'tech-2',
    wordSetId: 'ielts-technology',
    term: 'automation',
    ipa: '/ˌɔː.təˈmeɪ.ʃən/',
    meaningVi: 'tự động hóa',
    partOfSpeech: 'noun',
    exampleEn: 'Automation in factories has led to the loss of some jobs.',
    exampleVi: 'Tự động hóa trong các nhà máy đã dẫn đến việc mất một số việc làm.'
  },
  {
    id: 'tech-3',
    wordSetId: 'ielts-technology',
    term: 'cybersecurity',
    ipa: '/ˌsaɪ.bə.sɪˈkjʊə.rə.ti/',
    meaningVi: 'an ninh mạng',
    partOfSpeech: 'noun',
    exampleEn: 'Banks invest heavily in cybersecurity to protect customer data.',
    exampleVi: 'Các ngân hàng đầu tư mạnh vào an ninh mạng để bảo vệ dữ liệu khách hàng.'
  },
  {
    id: 'tech-4',
    wordSetId: 'ielts-technology',
    term: 'database',
    ipa: '/ˈdeɪ.tə.beɪs/',
    meaningVi: 'cơ sở dữ liệu',
    partOfSpeech: 'noun',
    exampleEn: 'The customer information is stored in a secure database.',
    exampleVi: 'Thông tin khách hàng được lưu trữ trong một cơ sở dữ liệu an toàn.'
  },
  {
    id: 'tech-5',
    wordSetId: 'ielts-technology',
    term: 'encryption',
    ipa: '/ɪnˈkrɪp.ʃən/',
    meaningVi: 'mã hóa',
    partOfSpeech: 'noun',
    exampleEn: 'End-to-end encryption ensures that your messages remain private.',
    exampleVi: 'Mã hóa đầu cuối đảm bảo rằng tin nhắn của bạn được giữ kín.'
  },
  {
    id: 'tech-6',
    wordSetId: 'ielts-technology',
    term: 'innovation',
    ipa: '/ˌɪn.əˈveɪ.ʃən/',
    meaningVi: 'sự đổi mới',
    partOfSpeech: 'noun',
    exampleEn: 'Technological innovation has rapidly changed the way we live.',
    exampleVi: 'Đổi mới công nghệ đã nhanh chóng thay đổi cách chúng ta sống.'
  },
  {
    id: 'tech-7',
    wordSetId: 'ielts-technology',
    term: 'bandwidth',
    ipa: '/ˈbænd.wɪtθ/',
    meaningVi: 'băng thông',
    partOfSpeech: 'noun',
    exampleEn: 'Streaming video requires a high-speed internet connection with plenty of bandwidth.',
    exampleVi: 'Việc truyền phát video đòi hỏi kết nối internet tốc độ cao với nhiều băng thông.'
  },
  {
    id: 'tech-8',
    wordSetId: 'ielts-technology',
    term: 'prototype',
    ipa: '/ˈprəʊ.tə.taɪp/',
    meaningVi: 'nguyên mẫu',
    partOfSpeech: 'noun',
    exampleEn: 'The engineers are testing a prototype of the new flying car.',
    exampleVi: 'Các kỹ sư đang thử nghiệm một nguyên mẫu của chiếc ô tô bay mới.'
  },
  {
    id: 'tech-9',
    wordSetId: 'ielts-technology',
    term: 'blockchain',
    ipa: '/ˈblɒk.tʃeɪn/',
    meaningVi: 'công nghệ chuỗi khối',
    partOfSpeech: 'noun',
    exampleEn: 'Cryptocurrencies like Bitcoin are built on blockchain technology.',
    exampleVi: 'Các loại tiền điện tử như Bitcoin được xây dựng trên công nghệ chuỗi khối.'
  },
  {
    id: 'tech-10',
    wordSetId: 'ielts-technology',
    term: 'interface',
    ipa: '/ˈɪn.tə.feɪs/',
    meaningVi: 'giao diện',
    partOfSpeech: 'noun',
    exampleEn: 'The software has a very simple and user-friendly interface.',
    exampleVi: 'Phần mềm có một giao diện rất đơn giản và thân thiện với người dùng.'
  },
  {
    id: 'tech-11',
    wordSetId: 'ielts-technology',
    term: 'malware',
    ipa: '/ˈmæl.weər/',
    meaningVi: 'phần mềm độc hại',
    partOfSpeech: 'noun',
    exampleEn: 'You should install antivirus software to protect your computer from malware.',
    exampleVi: 'Bạn nên cài đặt phần mềm diệt vi-rút để bảo vệ máy tính khỏi phần mềm độc hại.'
  },
  {
    id: 'tech-12',
    wordSetId: 'ielts-technology',
    term: 'biometric',
    ipa: '/ˌbaɪ.əʊˈmet.rɪk/',
    meaningVi: 'sinh trắc học',
    partOfSpeech: 'adjective',
    exampleEn: 'Many modern smartphones use biometric authentication, such as fingerprint or face recognition.',
    exampleVi: 'Nhiều điện thoại thông minh hiện đại sử dụng xác thực sinh trắc học, chẳng hạn như nhận dạng vân tay hoặc khuôn mặt.'
  },
  {
    id: 'tech-13',
    wordSetId: 'ielts-technology',
    term: 'semiconductor',
    ipa: '/ˌsem.i.kənˈdʌk.tər/',
    meaningVi: 'chất bán dẫn',
    partOfSpeech: 'noun',
    exampleEn: 'Taiwan is a global leader in semiconductor manufacturing.',
    exampleVi: 'Đài Loan là nước dẫn đầu toàn cầu về sản xuất chất bán dẫn.'
  },
  {
    id: 'tech-14',
    wordSetId: 'ielts-technology',
    term: 'quantum',
    ipa: '/ˈkwɒn.təm/',
    meaningVi: 'lượng tử',
    partOfSpeech: 'adjective',
    exampleEn: 'Quantum computing could solve complex problems much faster than traditional computers.',
    exampleVi: 'Điện toán lượng tử có thể giải quyết các vấn đề phức tạp nhanh hơn nhiều so với máy tính truyền thống.'
  },
  {
    id: 'tech-15',
    wordSetId: 'ielts-technology',
    term: 'robotics',
    ipa: '/rəʊˈbɒt.ɪks/',
    meaningVi: 'ngành chế tạo rô-bốt',
    partOfSpeech: 'noun',
    exampleEn: 'Advancements in robotics are transforming the healthcare industry.',
    exampleVi: 'Những tiến bộ trong ngành chế tạo rô-bốt đang biến đổi ngành chăm sóc sức khỏe.'
  },
  {
    id: 'tech-16',
    wordSetId: 'ielts-technology',
    term: 'nanotechnology',
    ipa: '/ˌnæn.əʊ.tekˈnɒl.ə.dʒi/',
    meaningVi: 'công nghệ nano',
    partOfSpeech: 'noun',
    exampleEn: 'Nanotechnology is being used to create more effective medical treatments.',
    exampleVi: 'Công nghệ nano đang được sử dụng để tạo ra các phương pháp điều trị y tế hiệu quả hơn.'
  },
  {
    id: 'tech-17',
    wordSetId: 'ielts-technology',
    term: 'virtual',
    ipa: '/ˈvɜː.tʃu.əl/',
    meaningVi: 'ảo',
    partOfSpeech: 'adjective',
    exampleEn: 'Virtual reality allows users to experience computer-generated environments.',
    exampleVi: 'Thực tế ảo cho phép người dùng trải nghiệm các môi trường do máy tính tạo ra.'
  },
  {
    id: 'tech-18',
    wordSetId: 'ielts-technology',
    term: 'digitize',
    ipa: '/ˈdɪdʒ.ɪ.taɪz/',
    meaningVi: 'số hóa',
    partOfSpeech: 'verb',
    exampleEn: 'Libraries are digitizing historical documents to make them accessible online.',
    exampleVi: 'Các thư viện đang số hóa các tài liệu lịch sử để mọi người có thể truy cập trực tuyến.'
  },
  {
    id: 'tech-19',
    wordSetId: 'ielts-technology',
    term: 'hardware',
    ipa: '/ˈhɑːd.weər/',
    meaningVi: 'phần cứng',
    partOfSpeech: 'noun',
    exampleEn: 'Upgrading the hardware can significantly improve computer performance.',
    exampleVi: 'Nâng cấp phần cứng có thể cải thiện đáng kể hiệu suất máy tính.'
  },
  {
    id: 'tech-20',
    wordSetId: 'ielts-technology',
    term: 'obsolete',
    ipa: '/ˌɒb.səlˈiːt/',
    meaningVi: 'lỗi thời',
    partOfSpeech: 'adjective',
    exampleEn: 'Rapid technological changes render some devices obsolete within a few years.',
    exampleVi: 'Những thay đổi công nghệ nhanh chóng khiến một số thiết bị trở nên lỗi thời trong vòng vài năm.'
  },

  // TOEIC WORKPLACE
  {
    id: 'work-1',
    wordSetId: 'toeic-workplace',
    term: 'deadline',
    ipa: '/ˈded.laɪn/',
    meaningVi: 'hạn chót',
    partOfSpeech: 'noun',
    exampleEn: 'We must finish this report before the Friday deadline.',
    exampleVi: 'Chúng ta phải hoàn thành báo cáo này trước hạn chót vào thứ Sáu.'
  },
  {
    id: 'work-2',
    wordSetId: 'toeic-workplace',
    term: 'conference',
    ipa: '/ˈkɒn.fər.əns/',
    meaningVi: 'hội nghị',
    partOfSpeech: 'noun',
    exampleEn: 'She is attending an international conference in Tokyo.',
    exampleVi: 'Cô ấy đang tham dự một hội nghị quốc tế tại Tokyo.'
  },
  {
    id: 'work-3',
    wordSetId: 'toeic-workplace',
    term: 'agenda',
    ipa: '/əˈdʒen.də/',
    meaningVi: 'chương trình nghị sự',
    partOfSpeech: 'noun',
    exampleEn: 'The next item on the agenda is the marketing budget.',
    exampleVi: 'Mục tiếp theo trong chương trình nghị sự là ngân sách tiếp thị.'
  },
  {
    id: 'work-4',
    wordSetId: 'toeic-workplace',
    term: 'colleague',
    ipa: '/ˈkɒl.iːɡ/',
    meaningVi: 'đồng nghiệp',
    partOfSpeech: 'noun',
    exampleEn: 'I get along well with all my colleagues at the office.',
    exampleVi: 'Tôi hòa đồng tốt với tất cả đồng nghiệp tại văn phòng.'
  },
  {
    id: 'work-5',
    wordSetId: 'toeic-workplace',
    term: 'supervisor',
    ipa: '/ˈsuː.pə.vaɪ.zər/',
    meaningVi: 'người giám sát, quản lý',
    partOfSpeech: 'noun',
    exampleEn: 'Please submit your leave request to your supervisor.',
    exampleVi: 'Vui lòng nộp đơn xin nghỉ phép cho người quản lý của bạn.'
  },
  {
    id: 'work-6',
    wordSetId: 'toeic-workplace',
    term: 'promotion',
    ipa: '/prəˈməʊ.ʃən/',
    meaningVi: 'sự thăng chức',
    partOfSpeech: 'noun',
    exampleEn: 'He worked hard and recently got a promotion to senior manager.',
    exampleVi: 'Anh ấy làm việc chăm chỉ và gần đây đã được thăng chức lên quản lý cấp cao.'
  },
  {
    id: 'work-7',
    wordSetId: 'toeic-workplace',
    term: 'resignation',
    ipa: '/ˌrez.ɪɡˈneɪ.ʃən/',
    meaningVi: 'sự từ chức',
    partOfSpeech: 'noun',
    exampleEn: 'The CEO announced his resignation yesterday.',
    exampleVi: 'Giám đốc điều hành đã tuyên bố từ chức vào ngày hôm qua.'
  },
  {
    id: 'work-8',
    wordSetId: 'toeic-workplace',
    term: 'overtime',
    ipa: '/ˈəʊ.və.taɪm/',
    meaningVi: 'làm thêm giờ',
    partOfSpeech: 'noun',
    exampleEn: 'Employees are paid extra for working overtime.',
    exampleVi: 'Nhân viên được trả thêm tiền vì làm thêm giờ.'
  },
  {
    id: 'work-9',
    wordSetId: 'toeic-workplace',
    term: 'benefit',
    ipa: '/ˈben.ɪ.fɪt/',
    meaningVi: 'phúc lợi',
    partOfSpeech: 'noun',
    exampleEn: 'The job offers a good salary and excellent health benefits.',
    exampleVi: 'Công việc cung cấp mức lương tốt và các phúc lợi sức khỏe tuyệt vời.'
  },
  {
    id: 'work-10',
    wordSetId: 'toeic-workplace',
    term: 'memo',
    ipa: '/ˈmem.əʊ/',
    meaningVi: 'bản ghi nhớ',
    partOfSpeech: 'noun',
    exampleEn: 'Did you read the memo about the new dress code?',
    exampleVi: 'Bạn đã đọc bản ghi nhớ về quy định trang phục mới chưa?'
  },
  {
    id: 'work-11',
    wordSetId: 'toeic-workplace',
    term: 'department',
    ipa: '/dɪˈpɑːt.mənt/',
    meaningVi: 'phòng ban',
    partOfSpeech: 'noun',
    exampleEn: 'She was transferred to the human resources department.',
    exampleVi: 'Cô ấy đã được thuyên chuyển sang phòng nhân sự.'
  },
  {
    id: 'work-12',
    wordSetId: 'toeic-workplace',
    term: 'policy',
    ipa: '/ˈpɒl.ə.si/',
    meaningVi: 'chính sách',
    partOfSpeech: 'noun',
    exampleEn: 'It is against company policy to use internet for personal reasons.',
    exampleVi: 'Việc sử dụng internet vì lý do cá nhân là trái với chính sách của công ty.'
  },
  {
    id: 'work-13',
    wordSetId: 'toeic-workplace',
    term: 'recruit',
    ipa: '/rɪˈkruːt/',
    meaningVi: 'tuyển dụng',
    partOfSpeech: 'verb',
    exampleEn: 'The company plans to recruit 50 new graduates this year.',
    exampleVi: 'Công ty có kế hoạch tuyển dụng 50 sinh viên mới tốt nghiệp trong năm nay.'
  },
  {
    id: 'work-14',
    wordSetId: 'toeic-workplace',
    term: 'contract',
    ipa: '/ˈkɒn.trækt/',
    meaningVi: 'hợp đồng',
    partOfSpeech: 'noun',
    exampleEn: 'Make sure you read the contract carefully before signing it.',
    exampleVi: 'Đảm bảo rằng bạn đọc kỹ hợp đồng trước khi ký.'
  },
  {
    id: 'work-15',
    wordSetId: 'toeic-workplace',
    term: 'salary',
    ipa: '/ˈsæl.ər.i/',
    meaningVi: 'tiền lương',
    partOfSpeech: 'noun',
    exampleEn: 'His starting salary is $50,000 a year.',
    exampleVi: 'Mức lương khởi điểm của anh ấy là 50.000 đô la một năm.'
  },
  {
    id: 'work-16',
    wordSetId: 'toeic-workplace',
    term: 'shift',
    ipa: '/ʃɪft/',
    meaningVi: 'ca làm việc',
    partOfSpeech: 'noun',
    exampleEn: 'Nurses often have to work the night shift.',
    exampleVi: 'Y tá thường xuyên phải làm việc ca đêm.'
  },
  {
    id: 'work-17',
    wordSetId: 'toeic-workplace',
    term: 'commute',
    ipa: '/kəˈmjuːt/',
    meaningVi: 'việc đi lại (đến nơi làm việc)',
    partOfSpeech: 'noun',
    exampleEn: 'My morning commute takes about 45 minutes by train.',
    exampleVi: 'Việc đi lại buổi sáng của tôi mất khoảng 45 phút bằng tàu hỏa.'
  },
  {
    id: 'work-18',
    wordSetId: 'toeic-workplace',
    term: 'workshop',
    ipa: '/ˈwɜːk.ʃɒp/',
    meaningVi: 'buổi hội thảo thực hành',
    partOfSpeech: 'noun',
    exampleEn: 'The team will participate in a team-building workshop next month.',
    exampleVi: 'Nhóm sẽ tham gia vào một hội thảo xây dựng nhóm vào tháng tới.'
  },
  {
    id: 'work-19',
    wordSetId: 'toeic-workplace',
    term: 'evaluate',
    ipa: '/ɪˈvæl.ju.eɪt/',
    meaningVi: 'đánh giá',
    partOfSpeech: 'verb',
    exampleEn: 'Managers evaluate employee performance once a year.',
    exampleVi: 'Các quản lý đánh giá hiệu suất của nhân viên mỗi năm một lần.'
  },
  {
    id: 'work-20',
    wordSetId: 'toeic-workplace',
    term: 'compensation',
    ipa: '/ˌkɒm.penˈseɪ.ʃən/',
    meaningVi: 'tiền bồi thường, thù lao',
    partOfSpeech: 'noun',
    exampleEn: 'He is demanding financial compensation for his unfair dismissal.',
    exampleVi: 'Anh ấy đang yêu cầu bồi thường tài chính cho việc bị sa thải bất công.'
  },

  // TOEIC TRAVEL
  {
    id: 'trv-1',
    wordSetId: 'toeic-travel',
    term: 'itinerary',
    ipa: '/aɪˈtɪn.ər.ər.i/',
    meaningVi: 'lịch trình',
    partOfSpeech: 'noun',
    exampleEn: 'Our travel itinerary includes visits to three different countries.',
    exampleVi: 'Lịch trình du lịch của chúng tôi bao gồm các chuyến thăm đến ba quốc gia khác nhau.'
  },
  {
    id: 'trv-2',
    wordSetId: 'toeic-travel',
    term: 'departure',
    ipa: '/dɪˈpɑː.tʃər/',
    meaningVi: 'sự khởi hành',
    partOfSpeech: 'noun',
    exampleEn: 'Please be at the gate 30 minutes before departure.',
    exampleVi: 'Vui lòng có mặt ở cổng 30 phút trước khi khởi hành.'
  },
  {
    id: 'trv-3',
    wordSetId: 'toeic-travel',
    term: 'luggage',
    ipa: '/ˈlʌɡ.ɪdʒ/',
    meaningVi: 'hành lý',
    partOfSpeech: 'noun',
    exampleEn: 'We left our luggage at the hotel reception.',
    exampleVi: 'Chúng tôi đã để lại hành lý ở quầy lễ tân khách sạn.'
  },
  {
    id: 'trv-4',
    wordSetId: 'toeic-travel',
    term: 'reservation',
    ipa: '/ˌrez.əˈveɪ.ʃən/',
    meaningVi: 'sự đặt trước',
    partOfSpeech: 'noun',
    exampleEn: 'I\'d like to make a dinner reservation for two people.',
    exampleVi: 'Tôi muốn đặt bàn ăn tối cho hai người.'
  },
  {
    id: 'trv-5',
    wordSetId: 'toeic-travel',
    term: 'accommodation',
    ipa: '/əˌkɒm.əˈdeɪ.ʃən/',
    meaningVi: 'chỗ ở',
    partOfSpeech: 'noun',
    exampleEn: 'The price of the tour includes flights and accommodation.',
    exampleVi: 'Giá của tour du lịch đã bao gồm vé máy bay và chỗ ở.'
  },
  {
    id: 'trv-6',
    wordSetId: 'toeic-travel',
    term: 'customs',
    ipa: '/ˈkʌs.təmz/',
    meaningVi: 'hải quan',
    partOfSpeech: 'noun',
    exampleEn: 'It took us an hour to get through customs at the airport.',
    exampleVi: 'Chúng tôi mất một giờ để qua hải quan tại sân bay.'
  },
  {
    id: 'trv-7',
    wordSetId: 'toeic-travel',
    term: 'terminal',
    ipa: '/ˈtɜː.mɪ.nəl/',
    meaningVi: 'nhà ga (sân bay, tàu hỏa)',
    partOfSpeech: 'noun',
    exampleEn: 'International flights depart from Terminal 2.',
    exampleVi: 'Các chuyến bay quốc tế khởi hành từ Nhà ga số 2.'
  },
  {
    id: 'trv-8',
    wordSetId: 'toeic-travel',
    term: 'fare',
    ipa: '/feər/',
    meaningVi: 'giá vé',
    partOfSpeech: 'noun',
    exampleEn: 'Train fares are going up again next month.',
    exampleVi: 'Giá vé tàu hỏa sẽ lại tăng vào tháng tới.'
  },
  {
    id: 'trv-9',
    wordSetId: 'toeic-travel',
    term: 'destination',
    ipa: '/ˌdes.tɪˈneɪ.ʃən/',
    meaningVi: 'điểm đến',
    partOfSpeech: 'noun',
    exampleEn: 'Paris is a popular tourist destination.',
    exampleVi: 'Paris là một điểm đến du lịch nổi tiếng.'
  },
  {
    id: 'trv-10',
    wordSetId: 'toeic-travel',
    term: 'check-in',
    ipa: '/ˈtʃek.ɪn/',
    meaningVi: 'thủ tục nhận phòng/đăng ký chuyến bay',
    partOfSpeech: 'noun',
    exampleEn: 'You must show your passport at the check-in desk.',
    exampleVi: 'Bạn phải xuất trình hộ chiếu tại quầy làm thủ tục.'
  },
  {
    id: 'trv-11',
    wordSetId: 'toeic-travel',
    term: 'transfer',
    ipa: '/trænsˈfɜːr/',
    meaningVi: 'sự trung chuyển, chuyển tiếp',
    partOfSpeech: 'noun',
    exampleEn: 'The hotel provides a free bus transfer to the airport.',
    exampleVi: 'Khách sạn cung cấp dịch vụ xe buýt trung chuyển miễn phí đến sân bay.'
  },
  {
    id: 'trv-12',
    wordSetId: 'toeic-travel',
    term: 'delay',
    ipa: '/dɪˈleɪ/',
    meaningVi: 'sự chậm trễ',
    partOfSpeech: 'noun',
    exampleEn: 'Due to bad weather, there is a two-hour delay on all flights.',
    exampleVi: 'Do thời tiết xấu, có sự chậm trễ hai giờ cho tất cả các chuyến bay.'
  },
  {
    id: 'trv-13',
    wordSetId: 'toeic-travel',
    term: 'currency',
    ipa: '/ˈkʌr.ən.si/',
    meaningVi: 'tiền tệ',
    partOfSpeech: 'noun',
    exampleEn: 'You can exchange your currency at the hotel reception.',
    exampleVi: 'Bạn có thể đổi tiền tại quầy lễ tân của khách sạn.'
  },
  {
    id: 'trv-14',
    wordSetId: 'toeic-travel',
    term: 'souvenir',
    ipa: '/ˌsuː.vənˈɪər/',
    meaningVi: 'đồ lưu niệm',
    partOfSpeech: 'noun',
    exampleEn: 'I bought this wooden carving as a souvenir of my trip to Bali.',
    exampleVi: 'Tôi đã mua bức tranh khắc gỗ này làm quà lưu niệm cho chuyến đi tới Bali của mình.'
  },
  {
    id: 'trv-15',
    wordSetId: 'toeic-travel',
    term: 'excursion',
    ipa: '/ɪkˈskɜː.ʃən/',
    meaningVi: 'chuyến tham quan',
    partOfSpeech: 'noun',
    exampleEn: 'We took a day excursion to the ancient ruins.',
    exampleVi: 'Chúng tôi đã có một chuyến tham quan trong ngày đến các tàn tích cổ xưa.'
  },
  {
    id: 'trv-16',
    wordSetId: 'toeic-travel',
    term: 'commute',
    ipa: '/kəˈmjuːt/',
    meaningVi: 'đi lại thường xuyên',
    partOfSpeech: 'verb',
    exampleEn: 'Many people commute to the city center for work.',
    exampleVi: 'Nhiều người đi lại đến trung tâm thành phố để làm việc.'
  },
  {
    id: 'trv-17',
    wordSetId: 'toeic-travel',
    term: 'passport',
    ipa: '/ˈpɑːs.pɔːt/',
    meaningVi: 'hộ chiếu',
    partOfSpeech: 'noun',
    exampleEn: 'Make sure your passport is valid for at least six months.',
    exampleVi: 'Hãy chắc chắn rằng hộ chiếu của bạn còn hạn ít nhất sáu tháng.'
  },
  {
    id: 'trv-18',
    wordSetId: 'toeic-travel',
    term: 'transit',
    ipa: '/ˈtræn.zɪt/',
    meaningVi: 'sự quá cảnh',
    partOfSpeech: 'noun',
    exampleEn: 'The goods were damaged in transit.',
    exampleVi: 'Hàng hóa đã bị hư hỏng trong quá trình vận chuyển (quá cảnh).'
  },
  {
    id: 'trv-19',
    wordSetId: 'toeic-travel',
    term: 'vacancy',
    ipa: '/ˈveɪ.kən.si/',
    meaningVi: 'phòng trống (khách sạn)',
    partOfSpeech: 'noun',
    exampleEn: 'We drove around until we found a hotel with a vacancy.',
    exampleVi: 'Chúng tôi lái xe vòng quanh cho đến khi tìm thấy một khách sạn còn phòng trống.'
  },
  {
    id: 'trv-20',
    wordSetId: 'toeic-travel',
    term: 'board',
    ipa: '/bɔːd/',
    meaningVi: 'lên tàu/máy bay',
    partOfSpeech: 'verb',
    exampleEn: 'Passengers are waiting to board the plane.',
    exampleVi: 'Hành khách đang chờ lên máy bay.'
  }
];
