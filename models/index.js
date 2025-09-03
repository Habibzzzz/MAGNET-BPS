// This file ensures all models are properly registered
// Import all models to ensure they are registered with mongoose
import './userInfo.js';
import './internInfo.js';
import './mentorInfo.js';
import './laporanInfo.js';
import './daftarHadirInfo.js';
import './izinInfo.js';
import './internAssesment.js';
import './sertifikat.js';
import './SertifikatTemplateInfo.js';
import './kuota.js';
import './geoFencingInfo.js';

// Export all models for convenience
export { default as User } from './userInfo.js';
export { default as Intern } from './internInfo.js';
export { default as Pembimbing } from './mentorInfo.js';
export { default as Laporan } from './laporanInfo.js';
export { default as DaftarHadir } from './daftarHadirInfo.js';
export { default as Izin } from './izinInfo.js';
export { default as Assessment } from './internAssesment.js';
export { default as Sertifikat } from './sertifikat.js';
export { default as SertifikatTemplate } from './SertifikatTemplateInfo.js';
export { default as Kuota } from './kuota.js';
export { default as GeoFencing } from './geoFencingInfo.js';
