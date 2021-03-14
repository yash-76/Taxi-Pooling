// import encrypting library
const bcrypt = require('bcrypt')

class AuthService {
	// connecting db and auth service
	constructor(db, mongoID) {
		this.db = db;
		this.mongoID = mongoID;
		this.creds = db.collection("userCredentials");
		console.log('Auth Service created')
	}

	// encrypting the password
	async hashPassword(password) {
		const hash = bcrypt.hashSync(password, 10);
		return hash
	}

	// comparing request password and db password
	async comparePassword(password, hash) {
		return bcrypt.compareSync(password, hash);
	}

	// signup function
	async addUser({ userID, password}) {
		// TODO: user id uniqueness check
		const passwordHash = await this.hashPassword(password)
		const isAdmin = false;
		await this.creds.insertOne({userID, passwordHash, isAdmin})
		return {
			message : "added user successfully"
		}
	}

	// TODO: change password function
	
	async changeAdminFlag({userID, adminFlag}){
		// only admins
		const filter = {userID};
		const newObj = {
			$set : {
				isAdmin : adminFlag
			}
		}
		await this.creds.updateOne(filter, newObj)
		return {
			message : `updated admin status of ${userID} to ${adminFlag}`
		}
	}

	// finding the user by req id
	async getUser({userID}){
		const userObj = await this.creds.findOne({userID});
		return userObj
	}

	// attempting sign in
	async tryLoginUser({userID, password}){
		const userObj = await this.getUser({userID});
		const {passwordHash} = userObj
		return this.comparePassword(password, passwordHash);
	}

	async tester({userID}){
		const obj = await this.getUser({userID});
		let tmp = obj._id.toString()
		tmp = new this.mongoID(tmp);
		const res = await this.creds.findOne({_id : tmp});
		console.log(res);
		return obj;
	}
}

module.exports = AuthService
