// Elective subject options per branch per subject code.
// If a student's subject isn't listed, they can type a custom name
// using the "Other" option in the dropdown.

export const ELECTIVE_OPTIONS = {
  CSE: {
    "BCSED1-51X": [
      "Computer Graphics",
      "Web Technologies",
      "Java Programming",
      "Python Programming",
      "IoT Fundamentals",
    ],
    "BCSED1-61X": [
      "Mobile App Development",
      "Machine Learning",
      "Distributed Systems",
      "Cloud Computing",
    ],
    "BCSED1-62X": [
      "Data Mining & Warehousing",
      "Parallel Processing",
      "Information Security",
      "Blockchain Technology",
    ],
    "BCSED1-71X": [
      "Distributed OS",
      "Soft Computing",
      "Human Computer Interaction",
      "Ad-hoc Networks",
    ],
    "BCSED1-72X": [
      "Bioinformatics",
      "Image Processing",
      "Cryptography & Network Security",
      "Artificial Intelligence",
    ],
    "BCSED1-81X": [
      "ERP Systems",
      "Internet of Things",
      "Advanced DBMS",
      "Software Project Management",
    ],
    "BCSOE1-6XX": [
      "Environmental Science",
      "Entrepreneurship",
      "Industrial Management",
      "Disaster Management",
      "Universal Human Values",
    ],
    "BCSOE1-7XX": [
      "Intellectual Property Rights",
      "Constitution of India",
      "Yoga & Wellness",
      "Principles of Economics",
    ],
    "BCSOE1-8X1": [
      "Soft Skills",
      "Professional Ethics",
      "Social Entrepreneurship",
    ],
    "BCSOE1-8X2": [
      "Startup Ecosystem",
      "Digital Marketing",
      "Supply Chain Management",
    ],
  },

  AIML: {
  "BCSED2-51X": [
    "Compiler Design",
    "Formal Language & Automata Theory",
    "Web Technologies",
    "Java Programming",
  ],
  "BCSED2-61X": [
    "Mobile Application Development",
    "Computer Graphics",
    "Natural Language Processing",
    "Computer Networks",
  ],
  "BCSED2-62X": [
    "Data Mining",
    "Data & Visual Analytics in AI",
    "Human Computer Interaction",
    "Embedded Systems",
  ],
  "BCSED2-71X": [
    "Advanced Machine Learning",
    "Soft Computing",
    "Parallel Processing",
    "Ad-hoc & Sensor Networks",
  ],
  "BCSED2-72X": [
    "Bioinformatics",
    "Image Processing",
    "Cryptography & Network Security",
    "Optimization Techniques in ML",
  ],
  "BCSED2-81X": [
    "Enterprise Resource Planning",
    "Internet of Things",
    "Cloud Computing",
    "Software Project Management",
  ],
  "BCSED2-6OE": ["Open Elective"],
  "BCSED2-7OE": ["Open Elective"],
  "BCSED2-8O1": ["Open Elective"],
  "BCSED2-8O2": ["Open Elective"],
},

  ECE: {
    "BECES1-508": [
      "Embedded Systems",
      "Biomedical Electronics",
      "Power Electronics",
      "Satellite Communication",
    ],
    "BECES1-606": [
      "Microwave Engineering",
      "Digital Image Processing",
      "MEMS Technology",
      "RF Circuit Design",
    ],
    "BECES1-704": [
      "Radar & Navigation Systems",
      "Advanced DSP",
      "Optical Networks",
      "Cognitive Radio",
    ],
    "BECES1-705": [
      "5G Networks",
      "Machine Learning for ECE",
      "Nanoelectronics",
      "Robotics & Automation",
    ],
    "BECES1-802": [
      "IoT & Smart Systems",
      "Advanced VLSI Design",
      "Wireless Sensor Networks",
    ],
    "BECES1-803": [
      "Computer Vision",
      "Deep Learning",
      "Cybersecurity for IoT",
    ],
    "BCSOE1-6XX": [
      "Environmental Science",
      "Entrepreneurship",
      "Industrial Management",
      "Universal Human Values",
    ],
    "BCSOE1-7XX": [
      "Intellectual Property Rights",
      "Constitution of India",
      "Yoga & Wellness",
      "Principles of Economics",
    ],
    "BCSOE1-8X1": [
      "Soft Skills",
      "Professional Ethics",
      "Digital Marketing",
    ],
  },

  EE: {
    "BELED1-51X": [
      "Renewable Energy Systems",
      "Electric Vehicles",
      "Smart Grid Technology",
      "Industrial Automation",
    ],
    "BELED1-61X": [
      "Power System Optimization",
      "Energy Audit & Management",
      "Flexible AC Transmission",
      "Drives & Control Systems",
    ],
    "BELED1-71X": [
      "Power Quality",
      "Energy Management Systems",
      "Advanced Power Electronics",
    ],
    "BELED1-72X": [
      "Microgrid Technology",
      "Electrical Safety Engineering",
      "Condition Monitoring",
    ],
    "BELED1-81X": [
      "Smart Metering Systems",
      "Deregulated Power Systems",
      "Energy Storage Technologies",
    ],
    "BELED1-82X": [
      "Artificial Intelligence in EE",
      "Electric Vehicle Technology",
      "Power System Protection",
    ],
    "BCSOE1-6XX": [
      "Environmental Science",
      "Entrepreneurship",
      "Industrial Management",
      "Universal Human Values",
    ],
    "BCSOE1-7XX": [
      "Intellectual Property Rights",
      "Constitution of India",
      "Yoga & Wellness",
      "Principles of Economics",
    ],
    "BCSOE1-8X1": [
      "Soft Skills",
      "Professional Ethics",
      "Digital Marketing",
    ],
  },

  ME: {
    "BMECD1-51X": [
      "Robotics & Automation",
      "Composite Materials",
      "Product Design & Development",
      "Operations Research",
    ],
    "BMECD1-61X": [
      "Additive Manufacturing",
      "Vibration Analysis",
      "Non-Destructive Testing",
    ],
    "BMECD1-71X": [
      "Advanced Manufacturing Processes",
      "Tribology",
      "Mechatronics",
    ],
    "BMECD1-72X": [
      "Total Quality Management",
      "Supply Chain Management",
      "Advanced Thermodynamics",
    ],
    "BMECD1-81X": [
      "Industry 4.0",
      "Smart Manufacturing",
      "Sustainable Engineering",
    ],
    "BMECD1-82X": [
      "Aerospace Engineering Basics",
      "Biomechanics",
      "Vehicle Dynamics",
    ],
    "BCSOE1-6XX": [
      "Environmental Science",
      "Entrepreneurship",
      "Industrial Management",
      "Universal Human Values",
    ],
    "BCSOE1-7XX": [
      "Intellectual Property Rights",
      "Constitution of India",
      "Yoga & Wellness",
      "Principles of Economics",
    ],
    "BCSOE1-8X1": [
      "Soft Skills",
      "Professional Ethics",
      "Digital Marketing",
    ],
  },

  CIVIL: {
    "BCIVED1-51X": [
      "Earthquake Engineering",
      "Remote Sensing & GIS",
      "Pavement Design",
      "Urban Planning & Development",
    ],
    "BCIVED1-61X": [
      "Advanced Structural Analysis",
      "Water Resources Engineering",
      "Smart Infrastructure",
    ],
    "BCIVED1-71X": [
      "Ground Improvement Techniques",
      "Bridge Engineering",
      "Tunnel Engineering",
    ],
    "BCIVED1-72X": [
      "Environmental Impact Assessment",
      "Coastal Engineering",
      "Solid Waste Management",
    ],
    "BCIVED1-81X": [
      "Construction Robotics",
      "BIM Technology",
      "Project Finance & Economics",
    ],
    "BCIVED1-82X": [
      "Heritage Conservation",
      "Disaster Resilient Design",
      "Green Building Technologies",
    ],
    "BCSOE1-6XX": [
      "Environmental Science",
      "Entrepreneurship",
      "Industrial Management",
      "Universal Human Values",
    ],
    "BCSOE1-7XX": [
      "Intellectual Property Rights",
      "Constitution of India",
      "Yoga & Wellness",
      "Principles of Economics",
    ],
    "BCSOE1-8X1": [
      "Soft Skills",
      "Professional Ethics",
      "Digital Marketing",
    ],
  },

  TE: {
    "BTED1-51X": [
      "Functional Textiles",
      "Sustainable Textiles",
      "Textile Testing & Quality Control",
      "Smart Textiles",
    ],
    "BTED1-61X": [
      "Textile Effluent Treatment",
      "Apparel CAD",
      "Textile Marketing & Merchandising",
    ],
    "BTED1-71X": [
      "Nano Textiles",
      "Composite Textiles",
      "Denim Technology",
    ],
    "BTED1-72X": [
      "Home Textiles",
      "Industrial Textiles",
      "Filtration Textiles",
    ],
    "BTED1-81X": [
      "Textile Export Management",
      "Fashion Merchandising",
      "Retail Management in Textiles",
    ],
    "BTED1-82X": [
      "Digital Printing Technology",
      "Sustainable Fashion",
      "Technical Textile Applications",
    ],
    "BCSOE1-6XX": [
      "Environmental Science",
      "Entrepreneurship",
      "Industrial Management",
      "Universal Human Values",
    ],
    "BCSOE1-7XX": [
      "Intellectual Property Rights",
      "Constitution of India",
      "Yoga & Wellness",
      "Principles of Economics",
    ],
    "BCSOE1-8X1": [
      "Soft Skills",
      "Professional Ethics",
      "Digital Marketing",
    ],
  },
};