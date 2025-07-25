const users = [
    { id: 1, name: "Ibrar", role: "Dev" },
    { id: 2, name: "Jane Doe", role: "Designer" },
    { id: 3, name: "John Smith", role: "DevOps" },
];

function getAllUsers() {
    return Array.from(users);
}

function createUser({name, role}){
    const newUser = {
        id: users.length+1,
        name,
        role,
    }
    users.push(newUser);

    return newUser;
}

module.exports = {
    getAllUsers,
    createUser,
};
