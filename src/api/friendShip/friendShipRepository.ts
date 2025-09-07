import { FriendshipModel, IFriendship } from "./friendShipModel";

export class FriendShipRepository {
  async findAllAsync(): Promise<IFriendship[]> {
    try {
      return await FriendshipModel.find().sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(
        `Failed to fetch friendships: ${(error as Error).message}`
      );
    }
  }
}
