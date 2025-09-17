import { FriendShipRepository } from "./friendShipRepository";

export class FriendShipService {
	private friendShipRepository: FriendShipRepository;
	constructor(repository: FriendShipRepository = new FriendShipRepository()) {
		this.friendShipRepository = repository;
	}
	async findAll() {
		return this.friendShipRepository.findAllAsync();
	}
	async createFriendShip(userIdOne: string, userIdTwo: string) {
		return this.friendShipRepository.createFriendShip(userIdOne, userIdTwo);
	}
}
export const friendShipService = new FriendShipService();
