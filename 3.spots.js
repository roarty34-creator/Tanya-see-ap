const ALL_BAIT_OPTIONS = [
  "Pilchard",
  "Pilchard belly",
  "Pilchard strip",
  "Makriel",
  "Live Makriel",
  "Chokka",
  "Chokka strip",
  "Chokka + Pilchard combo",
  "Squid",
  "Octopus",
  "Redbait",
  "Mussel",
  "Crab",
  "Feather lure",
  "Small spoon",
  "Metal spoon",
  "Surface plug",
  "Live bait"
];

const BAIT_BY_SPECIES = {
  "Cape Kob":["Chokka + Pilchard combo","Live Makriel","Pilchard belly","Chokka","Pilchard"],
  "Yellowtail":["Live Makriel","Pilchard strip","Metal spoon","Surface plug","Live bait"],
  "Bonito":["Pilchard strip","Small spoon","Feather lure","Makriel"],
  "Red Roman":["Chokka","Pilchard","Octopus","Squid"],
  "Snapper":["Chokka","Pilchard","Redbait","Squid"],
  "Silverfish":["Chokka strip","Pilchard strip","Pilchard"],
  "Red Steenbras":["Chokka","Pilchard","Redbait","Squid"],
  "Yellow Belly":["Chokka","Pilchard"],
  "Hottentot":["Chokka","Pilchard","Redbait","Mussel"]
};

const DEFAULT_SPOTS = [
  { id:"s1", name:"Skulpbank", lat:-34.3905, lon:20.8602, type:"Reef", preset:true },
  { id:"s2", name:"Blinde Rif", lat:-34.4015, lon:20.8801, type:"Reef", preset:true },
  { id:"s3", name:"Kabeljou Ridge", lat:-34.3750, lon:20.8700, type:"Reef", preset:true },
  { id:"s4", name:"Roman Bank", lat:-34.4200, lon:20.8650, type:"Reef", preset:true },
  { id:"s5", name:"Die Gat", lat:-34.3955, lon:20.8450, type:"Reef", preset:true },
  { id:"s6", name:"Stilbaai Rif", lat:-34.3888, lon:20.8570, type:"Reef", preset:true },
  { id:"s7", name:"Outer Bank", lat:-34.4305, lon:20.8355, type:"Reef", preset:true },
  { id:"s8", name:"South Deep", lat:-34.4300, lon:20.8800, type:"Deep", preset:true }
];
