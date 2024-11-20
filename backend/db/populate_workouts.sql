
-- Populate Workouts
INSERT INTO Workouts (name, description, group_id) VALUES 
-- Arms
('Bicep Curls', 'A basic workout targeting the biceps.', (SELECT id FROM WorkoutGroups WHERE name = 'Arms')),
('Tricep Dips', 'Targets the triceps and shoulders.', (SELECT id FROM WorkoutGroups WHERE name = 'Arms')),

-- Core
('Plank', 'A core workout for stability and strength.', (SELECT id FROM WorkoutGroups WHERE name = 'Core')),
('Russian Twists', 'Focuses on obliques and abdominal muscles.', (SELECT id FROM WorkoutGroups WHERE name = 'Core')),

-- Back
('Pull-Ups', 'Strengthens the back and arm muscles.', (SELECT id FROM WorkoutGroups WHERE name = 'Back')),
('Deadlifts', 'A compound exercise for back and legs.', (SELECT id FROM WorkoutGroups WHERE name = 'Back')),

-- Glutes
('Squats', 'Targets the glutes and legs.', (SELECT id FROM WorkoutGroups WHERE name = 'Glutes')),
('Hip Thrusts', 'Builds glute strength and endurance.', (SELECT id FROM WorkoutGroups WHERE name = 'Glutes')),

-- Legs
('Lunges', 'Works the quads, hamstrings, and glutes.', (SELECT id FROM WorkoutGroups WHERE name = 'Legs')),
('Leg Press', 'A machine-based leg workout.', (SELECT id FROM WorkoutGroups WHERE name = 'Legs'));
