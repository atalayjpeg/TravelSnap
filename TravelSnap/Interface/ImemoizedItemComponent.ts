export interface MemoizedItemComponentProps {
    item: {
      id: string;
      userId: string;
      displayName: string;
      image: string;
      caption: string;
    };
    onPress: (item: any) => void;
    onLikeClick: (item: any) => Promise<void>;
  }