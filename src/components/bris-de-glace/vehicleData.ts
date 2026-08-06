// Curated vehicle make → model dataset for the bris de glace dossier form.
// Both fields are freeSolo in the UI, so anything not listed can still be typed.
// Extend these lists as needed — the model dropdown reads from VEHICLE_MODELS[make].

export const VEHICLE_MODELS: Record<string, string[]> = {
  Volkswagen: ['Golf', 'Polo', 'Passat', 'Jetta', 'Tiguan', 'Touareg', 'Caddy', 'Amarok', 'T-Roc', 'Touran'],
  Peugeot: ['107', '108', '206', '207', '208', '301', '308', '2008', '3008', '5008', 'Partner', 'Boxer', 'Expert'],
  Renault: ['Clio', 'Symbol', 'Mégane', 'Kangoo', 'Captur', 'Kadjar', 'Talisman', 'Trafic', 'Master', 'Express'],
  Citroën: ['C3', 'C4', 'C5', 'Berlingo', 'C-Elysée', 'Jumpy', 'Jumper', 'C3 Aircross'],
  Ford: ['Fiesta', 'Focus', 'Fusion', 'Transit', 'Ranger', 'Kuga', 'EcoSport', 'Explorer'],
  Fiat: ['Punto', 'Tipo', 'Panda', 'Doblo', '500', 'Ducato', 'Fiorino'],
  Opel: ['Corsa', 'Astra', 'Insignia', 'Combo', 'Vivaro', 'Mokka', 'Zafira'],
  Toyota: ['Yaris', 'Corolla', 'Camry', 'Hilux', 'RAV4', 'Land Cruiser', 'Prado', 'Hiace', 'Avanza'],
  Kia: ['Picanto', 'Rio', 'Cerato', 'Sportage', 'Sorento', 'Ceed', 'Stonic', 'Carnival'],
  Hyundai: ['i10', 'i20', 'i30', 'Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Creta', 'H1'],
  Nissan: ['Micra', 'Sunny', 'Qashqai', 'Juke', 'X-Trail', 'Navara', 'Patrol', 'Kicks'],
  Dacia: ['Logan', 'Sandero', 'Duster', 'Dokker', 'Lodgy', 'Stepway'],
  Seat: ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Toledo'],
  'Škoda': ['Fabia', 'Octavia', 'Superb', 'Rapid', 'Kodiaq', 'Karoq', 'Kamiq'],
  'Mercedes-Benz': ['Classe A', 'Classe C', 'Classe E', 'Classe S', 'GLA', 'GLC', 'GLE', 'Vito', 'Sprinter'],
  BMW: ['Série 1', 'Série 2', 'Série 3', 'Série 4', 'Série 5', 'X1', 'X3', 'X5', 'X6'],
  Audi: ['A1', 'A3', 'A4', 'A5', 'A6', 'Q2', 'Q3', 'Q5', 'Q7'],
  Chevrolet: ['Spark', 'Aveo', 'Cruze', 'Captiva', 'Malibu', 'Trax'],
  Chery: ['QQ', 'Tiggo 2', 'Tiggo 4', 'Tiggo 7', 'Tiggo 8', 'Arrizo 5'],
  Suzuki: ['Swift', 'Baleno', 'Vitara', 'Jimny', 'Celerio', 'Ertiga'],
  Mitsubishi: ['Lancer', 'ASX', 'Outlander', 'Pajero', 'L200', 'Attrage'],
  Isuzu: ['D-Max', 'MU-X', 'NPR'],
  Mahindra: ['KUV100', 'XUV300', 'XUV500', 'Scorpio', 'Pik Up'],
  Mazda: ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'BT-50'],
  Honda: ['Jazz', 'Civic', 'Accord', 'CR-V', 'HR-V'],
  Volvo: ['V40', 'S60', 'S90', 'XC40', 'XC60', 'XC90'],
  'Land Rover': ['Defender', 'Discovery', 'Range Rover', 'Range Rover Evoque', 'Freelander'],
  Jeep: ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler'],
  Mini: ['Cooper', 'Countryman', 'Clubman'],
  Wallyscar: ['Iris', '719'],
  MG: ['MG3', 'MG5', 'ZS', 'HS'],
  Geely: ['Emgrand', 'Coolray', 'Azkarra'],
  'Great Wall': ['Wingle', 'Poer', 'Haval H6'],
  DFSK: ['Glory 500', 'Glory 580', 'K01', 'C31'],
  BYD: ['F3', 'Song', 'Han', 'Atto 3']
};

export const VEHICLE_MAKES: string[] = Object.keys(VEHICLE_MODELS).sort((a, b) => a.localeCompare(b, 'fr'));
