/**
 * Daily rental rates for each equipment type
 * These rates are in dollars per day
 */
export const EQUIPMENT_DAILY_RATES: { [equipmentType: string]: number } = {
  // Air Movers
  'AIR_MOVER': 25,
  'AIR_MOVER_AXIAL': 30,
  'AIR_MOVER_LOW_PROFILE': 35,
  
  // Dehumidifiers
  'DEHUMIDIFIER': 65,
  'DEHUMIDIFIER_LGR': 85,
  'DEHUMIDIFIER_COMMERCIAL': 95,
  'DEHUMIDIFIER_DESICCANT': 120,
  
  // Air Scrubbers
  'AIR_SCRUBBER': 60,
  'AIR_SCRUBBER_HEPA': 75,
  
  // HEPA Filters
  'HEPA_FILTER': 45,
  'HEPA_FILTER_REPLACEMENT': 25,
  
  // Measurement tools
  'MOISTURE_METER': 15,
  'MOISTURE_METER_PINLESS': 20,
  'THERMAL_IMAGING_CAMERA': 85,
  'THERMAL_HYGROMETER': 30,
  'MANOMETER': 25,
  
  // Treatment equipment
  'OZONE_GENERATOR': 75,
  'HYDROXYL_GENERATOR': 95,
  'FOGGER': 45,
  'ULV_FOGGER': 55,
  
  // Climate control
  'HEATER': 40,
  'PORTABLE_AC': 65,
  
  // Water damage specific
  'WATER_EXTRACTOR': 85,
  'WATER_EXTRACTOR_TRUCK_MOUNT': 175,
  'FLOOD_PUMPER': 110,
  'INJECTIDRY': 65,
  'FLOOR_DRYING_SYSTEM': 70,
  
  // Structural drying
  'WALL_CAVITY_DRYER': 35,
  'HARDWOOD_FLOOR_DRYING_MAT': 40,
  'DRYING_PANEL': 15,
  
  // Miscellaneous
  'EXTENSION_CORD': 5,
  'POWER_DISTRIBUTION_BOX': 25,
  'GENERATOR': 95,
  'AIR_FILTRATION_DEVICE': 50,
  
  // Misc equipment
  'OTHER': 20
}; 

/**
 * Equipment descriptions for customer-friendly explanations
 */
export const EQUIPMENT_DESCRIPTIONS: { [equipmentType: string]: string } = {
  'AIR_MOVER': 'Standard air mover for room drying',
  'AIR_MOVER_AXIAL': 'Axial air mover for high volume air movement',
  'AIR_MOVER_LOW_PROFILE': 'Low profile air mover for tight spaces',
  
  'DEHUMIDIFIER': 'Standard dehumidifier (30-50 pint)',
  'DEHUMIDIFIER_LGR': 'Low grain refrigerant dehumidifier',
  'DEHUMIDIFIER_COMMERCIAL': 'Commercial grade high capacity dehumidifier',
  'DEHUMIDIFIER_DESICCANT': 'Desiccant dehumidifier for low temperature conditions',
  
  'AIR_SCRUBBER': 'Standard air scrubber for air purification',
  'AIR_SCRUBBER_HEPA': 'HEPA air scrubber for advanced filtration',
  
  'HEPA_FILTER': 'HEPA filter unit for particulate removal',
  'HEPA_FILTER_REPLACEMENT': 'Replacement HEPA filter',
  
  'MOISTURE_METER': 'Standard penetrating moisture meter',
  'MOISTURE_METER_PINLESS': 'Non-invasive pinless moisture meter',
  'THERMAL_IMAGING_CAMERA': 'Thermal imaging camera for moisture detection',
  'THERMAL_HYGROMETER': 'Measures temperature and relative humidity',
  'MANOMETER': 'Measures air pressure differentials',
  
  'OZONE_GENERATOR': 'Ozone generator for odor elimination',
  'HYDROXYL_GENERATOR': 'Hydroxyl generator for safe occupied space deodorization',
  'FOGGER': 'Standard fogger for disinfectant application',
  'ULV_FOGGER': 'Ultra-low volume fogger for antimicrobial application',
  
  'HEATER': 'Portable heating unit',
  'PORTABLE_AC': 'Portable air conditioning unit',
  
  'WATER_EXTRACTOR': 'Portable water extraction unit',
  'WATER_EXTRACTOR_TRUCK_MOUNT': 'Truck-mounted high power water extractor',
  'FLOOD_PUMPER': 'Submersible pump for standing water',
  'INJECTIDRY': 'Targeted drying system for walls and cavities',
  'FLOOR_DRYING_SYSTEM': 'System for drying hardwood floors',
  
  'WALL_CAVITY_DRYER': 'Specialized unit for drying inside wall cavities',
  'HARDWOOD_FLOOR_DRYING_MAT': 'Mat system for drying hardwood floors',
  'DRYING_PANEL': 'Panel system for targeted structural drying',
  
  'EXTENSION_CORD': 'Heavy-duty extension cord',
  'POWER_DISTRIBUTION_BOX': 'Power distribution for multiple equipment',
  'GENERATOR': 'Portable power generator',
  'AIR_FILTRATION_DEVICE': 'Commercial grade air filtration unit',
  
  'OTHER': 'Other equipment'
};

/**
 * Equipment categories for organization and filtering
 */
export const EQUIPMENT_CATEGORIES = {
  AIR_MOVEMENT: [
    'AIR_MOVER',
    'AIR_MOVER_AXIAL',
    'AIR_MOVER_LOW_PROFILE'
  ],
  DEHUMIDIFICATION: [
    'DEHUMIDIFIER',
    'DEHUMIDIFIER_LGR',
    'DEHUMIDIFIER_COMMERCIAL',
    'DEHUMIDIFIER_DESICCANT'
  ],
  AIR_FILTRATION: [
    'AIR_SCRUBBER',
    'AIR_SCRUBBER_HEPA',
    'HEPA_FILTER',
    'HEPA_FILTER_REPLACEMENT',
    'AIR_FILTRATION_DEVICE'
  ],
  MEASUREMENT: [
    'MOISTURE_METER',
    'MOISTURE_METER_PINLESS',
    'THERMAL_IMAGING_CAMERA',
    'THERMAL_HYGROMETER',
    'MANOMETER'
  ],
  TREATMENT: [
    'OZONE_GENERATOR',
    'HYDROXYL_GENERATOR',
    'FOGGER',
    'ULV_FOGGER'
  ],
  CLIMATE_CONTROL: [
    'HEATER',
    'PORTABLE_AC'
  ],
  WATER_EXTRACTION: [
    'WATER_EXTRACTOR',
    'WATER_EXTRACTOR_TRUCK_MOUNT',
    'FLOOD_PUMPER'
  ],
  STRUCTURAL_DRYING: [
    'INJECTIDRY',
    'FLOOR_DRYING_SYSTEM',
    'WALL_CAVITY_DRYER',
    'HARDWOOD_FLOOR_DRYING_MAT',
    'DRYING_PANEL'
  ],
  ACCESSORIES: [
    'EXTENSION_CORD',
    'POWER_DISTRIBUTION_BOX',
    'GENERATOR'
  ],
  OTHER: [
    'OTHER'
  ]
}; 