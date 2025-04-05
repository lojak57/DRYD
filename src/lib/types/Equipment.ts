/**
 * Represents the status of equipment
 */
export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  DEPLOYED = 'DEPLOYED',
  MAINTENANCE = 'MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED'
}

/**
 * Represents equipment types available for jobs
 */
export enum EquipmentType {
  // Air Movers
  AIR_MOVER = 'AIR_MOVER',
  AIR_MOVER_AXIAL = 'AIR_MOVER_AXIAL',
  AIR_MOVER_LOW_PROFILE = 'AIR_MOVER_LOW_PROFILE',
  
  // Dehumidifiers
  DEHUMIDIFIER = 'DEHUMIDIFIER',
  DEHUMIDIFIER_LGR = 'DEHUMIDIFIER_LGR',
  DEHUMIDIFIER_COMMERCIAL = 'DEHUMIDIFIER_COMMERCIAL',
  DEHUMIDIFIER_DESICCANT = 'DEHUMIDIFIER_DESICCANT',
  
  // Air Scrubbers and Filtration
  AIR_SCRUBBER = 'AIR_SCRUBBER',
  AIR_SCRUBBER_HEPA = 'AIR_SCRUBBER_HEPA',
  HEPA_FILTER = 'HEPA_FILTER',
  HEPA_FILTER_REPLACEMENT = 'HEPA_FILTER_REPLACEMENT',
  AIR_FILTRATION_DEVICE = 'AIR_FILTRATION_DEVICE',
  
  // Measurement Equipment
  MOISTURE_METER = 'MOISTURE_METER',
  MOISTURE_METER_PINLESS = 'MOISTURE_METER_PINLESS',
  THERMAL_IMAGING_CAMERA = 'THERMAL_IMAGING_CAMERA',
  THERMAL_HYGROMETER = 'THERMAL_HYGROMETER',
  MANOMETER = 'MANOMETER',
  
  // Treatment Equipment
  OZONE_GENERATOR = 'OZONE_GENERATOR',
  HYDROXYL_GENERATOR = 'HYDROXYL_GENERATOR',
  FOGGER = 'FOGGER',
  ULV_FOGGER = 'ULV_FOGGER',
  
  // Climate Control
  HEATER = 'HEATER',
  PORTABLE_AC = 'PORTABLE_AC',
  
  // Water Extraction
  WATER_EXTRACTOR = 'WATER_EXTRACTOR',
  WATER_EXTRACTOR_TRUCK_MOUNT = 'WATER_EXTRACTOR_TRUCK_MOUNT',
  FLOOD_PUMPER = 'FLOOD_PUMPER',
  
  // Structural Drying
  INJECTIDRY = 'INJECTIDRY',
  FLOOR_DRYING_SYSTEM = 'FLOOR_DRYING_SYSTEM',
  WALL_CAVITY_DRYER = 'WALL_CAVITY_DRYER',
  HARDWOOD_FLOOR_DRYING_MAT = 'HARDWOOD_FLOOR_DRYING_MAT',
  DRYING_PANEL = 'DRYING_PANEL',
  
  // Accessories
  EXTENSION_CORD = 'EXTENSION_CORD',
  POWER_DISTRIBUTION_BOX = 'POWER_DISTRIBUTION_BOX',
  GENERATOR = 'GENERATOR',
  
  // Other
  OTHER = 'OTHER'
}

/**
 * Represents a piece of equipment in the inventory
 */
export interface Equipment {
  /** Unique identifier for the equipment */
  id: string;
  /** Type of equipment */
  type: EquipmentType;
  /** Model number or name */
  model: string;
  /** Serial number of the equipment */
  serialNumber: string;
  /** Current status of the equipment */
  status: EquipmentStatus;
  /** Current job ID if the equipment is deployed */
  currentJobId?: string | null;
  /** Date when the equipment was purchased */
  purchaseDate?: Date;
  /** Date of last maintenance */
  lastMaintenanceDate?: Date;
  /** Notes about the equipment */
  notes?: string;
  /** Current location where the equipment is stored when not in use */
  storageLocation?: string;
}

/**
 * Represents equipment log data for placement and removal activities
 */
export interface EquipmentLogData {
  /** Whether the equipment is being placed or removed */
  action: 'placement' | 'removal';
  /** ID of the equipment */
  equipmentId: string;
  /** Type of equipment (denormalized for easier display) */
  equipmentType: string;
  /** Equipment model */
  equipmentModel: string;
  /** Equipment serial number (optional) */
  equipmentSerialNumber?: string;
  /** Location where equipment was placed (relevant for placement) */
  location?: string;
  /** Settings applied to the equipment (relevant for placement) */
  settings?: Record<string, any>;
  /** Notes about the placement or removal */
  notes?: string;
} 