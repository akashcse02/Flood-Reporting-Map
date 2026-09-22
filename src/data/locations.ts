export type City = { name: string; areas: string[] };
export type Division = { name: string; cities: City[] };

const dhakaAreas = [
  "Uttara",
  "Mirpur",
  "Mohammadpur",
  "Dhanmondi",
  "Gulshan",
  "Banani",
  "Baridhara",
  "Bashundhara",
  "Badda",
  "Rampura",
  "Khilgaon",
  "Jatrabari",
  "Motijheel",
  "Lalbagh (Old Dhaka)",
  "Chawkbazar (Old Dhaka)",
  "Sutrapur (Old Dhaka)",
  "Mohakhali",
  "Tejgaon",
  "Farmgate",
  "Shyamoli",
  "Adabor",
  "Kafrul",
  "Cantonment",
  "Uttarkhan",
  "Dakshinkhan",
  "Turag",
  "Savar",
  "Keraniganj",
];

export const divisions: Division[] = [
  {
    name: "Dhaka",
    cities: [
      { name: "Dhaka", areas: dhakaAreas },
      { name: "Gazipur", areas: ["Gazipur Sadar", "Tongi", "Kaliakair", "Sreepur", "Kapasia"] },
      { name: "Narayanganj", areas: ["Narayanganj Sadar", "Fatullah", "Siddhirganj", "Rupganj", "Araihazar"] },
      { name: "Tangail", areas: ["Tangail Sadar", "Mirzapur", "Ghatail", "Kalihati", "Sakhipur"] },
      { name: "Manikganj", areas: ["Manikganj Sadar", "Singair", "Saturia", "Shibalaya"] },
      { name: "Munshiganj", areas: ["Munshiganj Sadar", "Sreenagar", "Lohajang", "Gazaria"] },
    ],
  },
  {
    name: "Chattogram",
    cities: [
      {
        name: "Chattogram",
        areas: ["Agrabad", "Khulshi", "Nasirabad", "Panchlaish", "Halishahar", "Chandgaon", "Patenga", "GEC Circle", "Bayezid", "Pahartali"],
      },
      { name: "Cox's Bazar", areas: ["Cox's Bazar Sadar", "Kolatoli", "Inani", "Teknaf", "Ramu", "Chakaria"] },
      { name: "Cumilla", areas: ["Cumilla Sadar", "Kandirpar", "Daudkandi", "Laksam", "Chauddagram"] },
      { name: "Noakhali", areas: ["Maijdee", "Begumganj", "Chatkhil", "Sonaimuri"] },
      { name: "Feni", areas: ["Feni Sadar", "Dagonbhuiyan", "Chhagalnaiya", "Sonagazi"] },
    ],
  },
  {
    name: "Rajshahi",
    cities: [
      { name: "Rajshahi", areas: ["Boalia", "Motihar", "Rajpara", "Shah Makhdum", "Kazla", "Uposhohor"] },
      { name: "Bogura", areas: ["Bogura Sadar", "Shibganj", "Sherpur", "Gabtali", "Dhunat", "Kahaloo", "Nandigram", "Sariakandi", "Sonatala", "Adamdighi"] },
      { name: "Pabna", areas: ["Pabna Sadar", "Ishwardi", "Sujanagar", "Bera", "Chatmohar"] },
      { name: "Sirajganj", areas: ["Sirajganj Sadar", "Ullapara", "Shahjadpur", "Kazipur"] },
      { name: "Natore", areas: ["Natore Sadar", "Singra", "Bagatipara", "Lalpur"] },
    ],
  },
  {
    name: "Khulna",
    cities: [
      { name: "Khulna", areas: ["Khalishpur", "Sonadanga", "Daulatpur", "Khan Jahan Ali", "Rupsha", "Boyra"] },
      { name: "Jashore", areas: ["Jashore Sadar", "Jhikargacha", "Benapole", "Keshabpur", "Abhaynagar"] },
      { name: "Kushtia", areas: ["Kushtia Sadar", "Bheramara", "Kumarkhali", "Mirpur"] },
      { name: "Satkhira", areas: ["Satkhira Sadar", "Kaliganj", "Shyamnagar", "Tala"] },
    ],
  },
  {
    name: "Barishal",
    cities: [
      { name: "Barishal", areas: ["Barishal Sadar", "Band Road", "Rupatali", "Nathullabad", "Bakerganj"] },
      { name: "Patuakhali", areas: ["Patuakhali Sadar", "Kuakata", "Galachipa", "Bauphal"] },
      { name: "Bhola", areas: ["Bhola Sadar", "Charfasson", "Lalmohan", "Borhanuddin"] },
    ],
  },
  {
    name: "Sylhet",
    cities: [
      { name: "Sylhet", areas: ["Zindabazar", "Amberkhana", "Uposhohor", "Subid Bazar", "Shahjalal Uposhohor", "Tilagarh", "Airport Road"] },
      { name: "Moulvibazar", areas: ["Moulvibazar Sadar", "Srimangal", "Kamalganj", "Kulaura"] },
      { name: "Habiganj", areas: ["Habiganj Sadar", "Madhabpur", "Nabiganj", "Chunarughat"] },
      { name: "Sunamganj", areas: ["Sunamganj Sadar", "Chhatak", "Jagannathpur", "Tahirpur"] },
    ],
  },
  {
    name: "Rangpur",
    cities: [
      { name: "Rangpur", areas: ["Rangpur Sadar", "Jahaj Company More", "Dhap", "Mahiganj", "Badarganj"] },
      { name: "Dinajpur", areas: ["Dinajpur Sadar", "Parbatipur", "Birampur", "Fulbari"] },
      { name: "Thakurgaon", areas: ["Thakurgaon Sadar", "Pirganj", "Ranisankail"] },
      { name: "Kurigram", areas: ["Kurigram Sadar", "Ulipur", "Nageshwari"] },
    ],
  },
  {
    name: "Mymensingh",
    cities: [
      { name: "Mymensingh", areas: ["Mymensingh Sadar", "Charpara", "Ganginar Par", "Trishal", "Bhaluka", "Muktagachha"] },
      { name: "Jamalpur", areas: ["Jamalpur Sadar", "Sarishabari", "Islampur", "Madarganj"] },
      { name: "Netrokona", areas: ["Netrokona Sadar", "Durgapur", "Mohanganj"] },
      { name: "Sherpur", areas: ["Sherpur Sadar", "Nalitabari", "Nakla"] },
    ],
  },
];

export const getCities = (division?: string) =>
  divisions.find((d) => d.name === division)?.cities ?? [];

export const getAreas = (division?: string, city?: string) =>
  getCities(division).find((c) => c.name === city)?.areas ?? [];
