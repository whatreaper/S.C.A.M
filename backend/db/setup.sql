-- Drop existing tables if they exist
DROP TABLE IF EXISTS UserWorkoutProgress CASCADE;
DROP TABLE IF EXISTS Workouts CASCADE;
DROP TABLE IF EXISTS WorkoutGroups CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

-- Create Users table
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    total_points INTEGER DEFAULT 0
);

-- Create WorkoutGroups table
CREATE TABLE WorkoutGroups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Create Workouts table
CREATE TABLE Workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    group_id UUID REFERENCES WorkoutGroups(id) ON DELETE CASCADE
);

-- Create UserWorkoutProgress table
CREATE TABLE UserWorkoutProgress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES Workouts(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('Not Started', 'In Progress', 'Done')) DEFAULT 'Not Started',
    points INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_workout UNIQUE (user_id, workout_id)
);

-- Create function to update total points
CREATE OR REPLACE FUNCTION update_total_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Users
    SET total_points = COALESCE((
        SELECT SUM(points)
        FROM UserWorkoutProgress
        WHERE user_id = NEW.user_id
    ), 0)
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update total points after insert or update
CREATE TRIGGER update_user_total_points
AFTER INSERT OR UPDATE ON UserWorkoutProgress
FOR EACH ROW
EXECUTE FUNCTION update_total_points();

-- Insert predefined workout groups
INSERT INTO WorkoutGroups (name) VALUES
('Arms'),
('Core'),
('Back'),
('Glutes'),
('Legs');

-- Insert predefined workouts
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


GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO s-c-a-m-ibwkya-db;