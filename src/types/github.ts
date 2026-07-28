// Type definitions for GitHub API payloads and GitStats components

export interface GitHubLicense {
  key: string;
  name: string;
  spdx_id: string;
  url: string;
}

export interface GitHubProfile {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  clone_url: string;
  license: GitHubLicense | null;
  languages_url: string;
}

// Component Props Interfaces

export interface ProfileCardProps {
  profile: GitHubProfile | null;
  loading: boolean;
}

export interface StatsBarProps {
  profile: GitHubProfile | null;
  repos: GitHubRepo[];
  loading: boolean;
}

export interface LanguageChartProps {
  repos: GitHubRepo[];
  loading: boolean;
}

export interface RepoCardProps {
  repo: GitHubRepo | null;
  loading: boolean;
  index?: number;
}
