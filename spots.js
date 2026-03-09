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

const BAIT_BY_SPECIES = {
  "Cape Kob":["Pilchard","Chokka","Makriel"],
  "Yellowtail":["Makriel","Pilchard","Squid"],
  "Bonito":["Makriel","Pilchard","Squid"],
  "Red Roman":["Chokka","Squid","Octopus"],
  "Snapper":["Chokka","Squid","Pilchard"],
  "Silverfish":["Pilchard","Chokka"],
  "Red Steenbras":["Chokka","Pilchard","Squid"],
  "Yellow Belly":["Pilchard","Chokka"],
  "Hottentot":["Pilchard","Chokka"]
};
