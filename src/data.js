export const ROLES = {
  STUDENT: 'student',
  STUDENT_LEADER: 'student_leader',
  LEADER: 'leader',
  ADVISOR: 'advisor',
  CHAPERONE: 'chaperone'
};

const STUDENT_BASE_PERMS = ['view', 'submit_hours', 'upload_photos', 'create_posts'];
const LEADERSHIP_PERMS = ['approve_photos', 'approve_hours', 'create_announcements', 'create_calendar_global'];

export const PERMISSIONS = {
  [ROLES.STUDENT]: STUDENT_BASE_PERMS,
  [ROLES.STUDENT_LEADER]: [...STUDENT_BASE_PERMS, ...LEADERSHIP_PERMS],
  [ROLES.LEADER]: [...STUDENT_BASE_PERMS, ...LEADERSHIP_PERMS],
  [ROLES.ADVISOR]: [...STUDENT_BASE_PERMS, ...LEADERSHIP_PERMS, 'manage_students'],
  [ROLES.CHAPERONE]: [...STUDENT_BASE_PERMS, 'check_in', 'create_checkin_times', 'mark_checkin_times']
};

export const hasPermission = (user, perm) => user && PERMISSIONS[user.role]?.includes(perm);

export const CHECKLIST_ITEMS = [
  {id:'1',text:'Device (laptop/tablet)',category:'Technology'},
  {id:'2',text:'Device charger',category:'Technology'},
  {id:'3',text:'Presentation clicker',category:'Technology'},
  {id:'4',text:'Blazer/Suit jacket',category:'Attire'},
  {id:'5',text:'Dress shirt',category:'Attire'},
  {id:'6',text:'Formal pants/skirt',category:'Attire'},
  {id:'7',text:'Dress shoes',category:'Attire'},
  {id:'8',text:'FBLA pin/name badge',category:'Attire'},
  {id:'9',text:'Study materials',category:'Documents'},
  {id:'10',text:'Registration confirmation',category:'Documents'},
  {id:'11',text:'ID card',category:'Documents'},
  {id:'12',text:'Snacks and water',category:'Personal'}
];

export const initialDB = {
  users:[
    {id:'1',memberId:'FBLA001',name:'John Smith',role:ROLES.STUDENT,points:1250,chapter:'Lincoln High',avatar:'JS',bio:'Aspiring entrepreneur',connections:['2','3'],skills:['Public Speaking','Marketing'],linkedin:'johnsmith',checkedIn:false},
    {id:'2',memberId:'FBLA002',name:'Sarah Johnson',role:ROLES.STUDENT_LEADER,points:2180,chapter:'Lincoln High',avatar:'SJ',bio:'Chapter President',connections:['1','3'],skills:['Leadership','Economics'],linkedin:'sarahjohnson',checkedIn:false},
    {id:'3',memberId:'FBLA003',name:'Dr. Williams',role:ROLES.ADVISOR,points:0,chapter:'Lincoln High',avatar:'DW',bio:'Chapter Advisor',connections:['1','2'],skills:['Mentoring'],linkedin:'drwilliams',checkedIn:false},
    {id:'8',memberId:'FBLA008',name:'Taylor Brooks',role:ROLES.CHAPERONE,points:760,chapter:'Lincoln High',avatar:'TB',bio:'Competition chaperone',connections:['1','2'],skills:['Coordination'],linkedin:'',checkedIn:false},
    {id:'4',memberId:'FBLA004',name:'Mike Chen',role:ROLES.STUDENT,points:980,chapter:'Lincoln High',avatar:'MC',bio:'Tech enthusiast',connections:[],skills:['Coding','App Dev'],linkedin:'mikechen',checkedIn:false},
    {id:'5',memberId:'FBLA005',name:'Emma Davis',role:ROLES.STUDENT,points:1540,chapter:'Lincoln High',avatar:'ED',bio:'Marketing wizard',connections:[],skills:['Social Media'],linkedin:'emmadavis',checkedIn:false},
    {id:'6',memberId:'FBLA006',name:'Alex Rivera',role:ROLES.STUDENT,points:890,chapter:'Lincoln High',avatar:'AR',bio:'Economics fan',connections:[],skills:['Economics'],linkedin:'',checkedIn:false},
    {id:'7',memberId:'FBLA007',name:'Jessica Kim',role:ROLES.STUDENT,points:1120,chapter:'Lincoln High',avatar:'JK',bio:'Future accountant',connections:[],skills:['Accounting'],linkedin:'jessicakim',checkedIn:false}
  ],
  posts:[
    {id:'1',userId:'2',content:'🎉 Just qualified for State Leadership Conference! #FBLA',timestamp:Date.now()-3600000,likes:['1','3','4'],comments:[{id:'c1',userId:'1',text:'Congrats! 🙌',timestamp:Date.now()-1800000}]},
    {id:'2',userId:'1',content:'Pro tip: Practice in front of a mirror for Public Speaking! 📢',timestamp:Date.now()-86400000,likes:['2','4','5'],comments:[]},
    {id:'3',userId:'4',content:'Just finished my mobile app for competition! 💻',timestamp:Date.now()-172800000,likes:['1','2'],comments:[]}
  ],
  announcements:[
    {id:'1',userId:'3',title:'State Competition Registration',content:'Registration open! Deadline March 1st.',timestamp:Date.now()-86400000,priority:'high'},
    {id:'2',userId:'2',title:'Chapter Meeting Tomorrow',content:'Weekly meeting at 3:30 PM in Room 204.',timestamp:Date.now()-172800000,priority:'normal'}
  ],
  events:[
    {id:'1',title:'State Leadership Conference',date:'2025-03-15',time:'09:00',location:'Convention Center',type:'chapter',color:'#0a2e7f',createdBy:'3'},
    {id:'2',title:'Chapter Meeting',date:'2025-02-20',time:'15:30',location:'Room 204',type:'chapter',color:'#F2A900',createdBy:'2'},
    {id:'3',title:'Fundraiser Planning',date:'2025-02-25',time:'14:00',location:'Library',type:'chapter',color:'#10b981',createdBy:'2'}
  ],
  serviceHours:[
    {id:'1',userId:'1',hours:12,description:'Community food drive',date:'2025-02-10',status:'approved',approvedBy:'3'},
    {id:'2',userId:'1',hours:5,description:'School cleanup',date:'2025-02-12',status:'pending',approvedBy:null},
    {id:'3',userId:'4',hours:8,description:'Tutoring students',date:'2025-02-08',status:'approved',approvedBy:'3'},
    {id:'4',userId:'5',hours:6,description:'Charity campaign',date:'2025-02-11',status:'pending',approvedBy:null}
  ],
  photos:[
    {id:'1',userId:'1',url:'https://picsum.photos/400/400?random=1',caption:'Regional Competition',status:'approved',approvedBy:'2'},
    {id:'2',userId:'4',url:'https://picsum.photos/400/400?random=2',caption:'Chapter Meeting',status:'pending',approvedBy:null},
    {id:'3',userId:'5',url:'https://picsum.photos/400/400?random=3',caption:'Leadership Workshop',status:'approved',approvedBy:'3'},
    {id:'4',userId:'2',url:'https://picsum.photos/400/400?random=4',caption:'Community Service',status:'approved',approvedBy:'3'}
  ],
  competitiveEvents:[
    {id:'accounting1',name:'Accounting I',type:'objective',duration:60,category:'Finance',icon:'📊'},
    {id:'business-management',name:'Business Management',type:'objective',duration:60,category:'Business',icon:'💼'},
    {id:'economics',name:'Economics',type:'objective',duration:60,category:'Finance',icon:'📈'},
    {id:'marketing',name:'Marketing',type:'objective',duration:60,category:'Marketing',icon:'📣'},
    {id:'personal-finance',name:'Personal Finance',type:'objective',duration:60,category:'Finance',icon:'💰'},
    {id:'entrepreneurship',name:'Entrepreneurship',type:'objective',duration:60,category:'Business',icon:'🚀'},
    {id:'cyber-security',name:'Cyber Security',type:'objective',duration:60,category:'Technology',icon:'🔒'},
    {id:'public-speaking',name:'Public Speaking',type:'performance',duration:5,category:'Communication',icon:'🎤'},
    {id:'impromptu',name:'Impromptu Speaking',type:'performance',duration:4,category:'Communication',icon:'💬'}
  ],
  quizQuestions:{
    'accounting1':[{q:'What is the accounting equation?',options:['Assets = Liabilities + Equity','Revenue - Expenses = Profit','Debits = Credits','Cash = Revenue'],answer:0},{q:'Which statement shows financial position?',options:['Income Statement','Balance Sheet','Cash Flow','Statement of Changes'],answer:1},{q:'What type of account is Accounts Receivable?',options:['Liability','Asset','Equity','Revenue'],answer:1},{q:'GAAP stands for:',options:['Generally Accepted Accounting Principles','Global Accounting Practices','General Audit Procedures','Government Accounting'],answer:0},{q:'Which method records revenue when cash is received?',options:['Accrual basis','Cash basis','Modified basis','Hybrid basis'],answer:1}],
    'business-management':[{q:'What is the purpose of SWOT analysis?',options:['Financial planning','Strategic planning','Employee evaluation','Customer analysis'],answer:1},{q:'Which management style involves employees in decisions?',options:['Autocratic','Democratic','Laissez-faire','Bureaucratic'],answer:1},{q:'The 4 Ps of marketing are:',options:['Price, Product, Place, Promotion','People, Process, Physical, Profit','Plan, Produce, Price, Promote','Position, Product, Price, Profit'],answer:0},{q:'ROI stands for:',options:['Return on Investment','Rate of Interest','Revenue on Income','Ratio of Investment'],answer:0},{q:'Which structure features clear authority lines?',options:['Matrix','Flat','Hierarchical','Network'],answer:2}],
    'economics':[{q:'GDP stands for:',options:['Government Debt Payment','Gross Domestic Product','General Distribution','Global Development'],answer:1},{q:'As price increases, demand:',options:['Increases','Decreases','Stays same','Doubles'],answer:1},{q:'Many sellers with identical products is:',options:['Monopoly','Oligopoly','Perfect competition','Monopolistic competition'],answer:2},{q:'Inflation is:',options:['Decrease in money','Increase in price levels','Increase in unemployment','Decrease in GDP'],answer:1},{q:'The Federal Reserve controls:',options:['Fiscal policy','Monetary policy','Trade policy','Tax policy'],answer:1}],
    'marketing':[{q:'Market segmentation involves:',options:['Dividing market into groups','Increasing prices','Reducing variety','Eliminating competition'],answer:0},{q:'A unique value proposition is:',options:['Price point','What sets you apart','Ad budget','Store location'],answer:1},{q:'Product life cycle includes:',options:['Introduction, Growth, Maturity, Decline','Start, Middle, End','Plan, Do, Check, Act','Design, Build, Test, Launch'],answer:0}],
    'personal-finance':[{q:'Compound interest means:',options:['Interest on principal only','Interest on principal and accumulated interest','Fixed rate','No interest'],answer:1},{q:'A 401(k) is a:',options:['Savings account','Retirement account','Checking account','Credit card'],answer:1},{q:'Your credit score is affected by:',options:['Your age','Payment history','Education','Job title'],answer:1}],
    'entrepreneurship':[{q:'A business plan includes:',options:['Only financials','Executive summary, market analysis, financials','Just the idea','Employee names'],answer:1},{q:'Venture capital is:',options:['Bank loan','Investment for equity','Government grant','Personal savings'],answer:1},{q:'MVP stands for:',options:['Most Valuable Player','Minimum Viable Product','Maximum Value Price','Market Value'],answer:1}],
    'cyber-security':[{q:'Phishing is:',options:['Type of fishing','Fraudulent attempt to get info','Computer virus','Firewall'],answer:1},{q:'Two-factor authentication adds:',options:['Two passwords','Extra security layer','Two usernames','Double encryption'],answer:1},{q:'A firewall:',options:['Prevents all internet','Monitors network traffic','Speeds up internet','Stores passwords'],answer:1}]
  },
  resources:[
    {id:'1',eventId:'accounting1',title:'Accounting I Rubric',type:'pdf',pages:45,downloaded:false,file:'/rubrics/accounting1.pdf'},
    {id:'2',eventId:'business-management',title:'Business Management Rubric',type:'pdf',pages:62,downloaded:false,file:'/rubrics/business-management.pdf'},
    {id:'3',eventId:'economics',title:'Economics Rubric',type:'pdf',pages:58,downloaded:false,file:'/rubrics/economics.pdf'},
    {id:'4',eventId:'marketing',title:'Marketing Rubric',type:'pdf',pages:40,downloaded:false,file:'/rubrics/marketing.pdf'},
    {id:'5',eventId:'personal-finance',title:'Personal Finance Rubric',type:'pdf',pages:35,downloaded:false,file:'/rubrics/personal-finance.pdf'},
    {id:'6',eventId:'entrepreneurship',title:'Entrepreneurship Rubric',type:'pdf',pages:42,downloaded:false,file:'/rubrics/entrepreneurship.pdf'},
    {id:'7',eventId:'cyber-security',title:'Cyber Security Rubric',type:'pdf',pages:38,downloaded:false,file:'/rubrics/cyber-security.pdf'},
    {id:'8',eventId:'public-speaking',title:'Public Speaking Rubric',type:'pdf',pages:20,downloaded:false,file:'/rubrics/public-speaking.pdf'},
    {id:'9',eventId:'impromptu',title:'Impromptu Speaking Rubric',type:'pdf',pages:18,downloaded:false,file:'/rubrics/impromptu.pdf'}
  ],
  checkins:[],
  checkInSchedules:[],
  checkInRecords:[]
};

