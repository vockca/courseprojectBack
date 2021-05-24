const ServerMessages = {
    userNotAuthorized: (data) => ( {
        msg: 'User is not authorized',
        data: data,
    }),

    success: (data) => ({
        msg: "Success",
        data: data,
    }),

    errorWithStatus: (data) => ({
        msg: 'Error with user status',
        data: data,
    }),

    serverError: (data) => ({
        msg: 'Server error',
        data: data,
    }),

    dataError: (data) => ({
        msg: 'Can not find what you are asking',
        data: data,
    }),

    userBanned: (data) => ({
        msg: 'You are banned',
        data: data,
        token: null,
    })
}

module.exports = ServerMessages;