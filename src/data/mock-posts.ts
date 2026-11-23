export type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

export const MOCK_POSTS: Post[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  userId: Math.floor(i / 10) + 1,
  title: `글 제목 ${i + 1}`,
  body: `글 본문 ${i + 1} ...`,
}));
