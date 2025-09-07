import { FriendShipRepository } from "./friendShipRepository";

export class FriendShipService {
  private friendShipRepository: FriendShipRepository;
  constructor(repository: FriendShipRepository = new FriendShipRepository()) {
    this.friendShipRepository = repository;
  }
  async findAll() {
    return this.friendShipRepository.findAllAsync();
  }
}
export const friendShipService = new FriendShipService();
