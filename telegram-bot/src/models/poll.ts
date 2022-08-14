export interface Poll {
  id: string;
  question: string;
  options: {
    text: string;
    voter_count: number;
  }[];
  total_voter_count: number;
  is_closed: boolean;
  is_anonymous: boolean;
  type: string;
  allows_multiple_answers: boolean;
}
