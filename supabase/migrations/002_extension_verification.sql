-- Extension and verification features migration

-- Create completion_tokens table for Chrome extension
CREATE TABLE IF NOT EXISTS completion_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create platform_verifications table
CREATE TABLE IF NOT EXISTS platform_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_username TEXT NOT NULL,
  verification_phrase TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Create indexes
CREATE INDEX idx_completion_tokens_user_id ON completion_tokens(user_id);
CREATE INDEX idx_completion_tokens_task_id ON completion_tokens(task_id);
CREATE INDEX idx_completion_tokens_token ON completion_tokens(token);
CREATE INDEX idx_completion_tokens_expires_at ON completion_tokens(expires_at);
CREATE INDEX idx_platform_verifications_user_id ON platform_verifications(user_id);
CREATE INDEX idx_platform_verifications_platform ON platform_verifications(platform);

-- Enable RLS
ALTER TABLE completion_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for completion_tokens

-- Users can read their own tokens
CREATE POLICY "Users can read own tokens"
  ON completion_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own tokens
CREATE POLICY "Users can create own tokens"
  ON completion_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tokens
CREATE POLICY "Users can update own tokens"
  ON completion_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for platform_verifications

-- Users can read their own verifications
CREATE POLICY "Users can read own verifications"
  ON platform_verifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own verifications
CREATE POLICY "Users can create own verifications"
  ON platform_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own verifications
CREATE POLICY "Users can update own verifications"
  ON platform_verifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
