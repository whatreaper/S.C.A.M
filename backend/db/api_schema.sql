-- Search History Table
CREATE TABLE SearchHistory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    query VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nutrition Data Table
CREATE TABLE NutritionData (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_history_id UUID REFERENCES SearchHistory(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    calories INTEGER,
    fat_total_g REAL,
    carbohydrates_total_g REAL,
    fiber_g REAL,
    protein_g REAL,
    sodium_mg INTEGER,
    sugar_g REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
