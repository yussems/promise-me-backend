import { FriendRequestModel } from "./friendRequestModel";

export class FriendShipRepository {
  async areFriendsAsync(userId1: string, userId2: string): Promise<boolean> {
    try {
      const count = await FriendRequestModel.countDocuments({
        $or: [
          { user1Id: userId1, user2Id: userId2 },
          { user1Id: userId2, user2Id: userId1 },
        ],
      });
      return count > 0;
    } catch (error) {
      throw new Error(
        `Failed to check friendship between ${userId1} and ${userId2}: ${
          (error as Error).message
        }`
      );
    }
  }
}
