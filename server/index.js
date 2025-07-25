const {app} = require('./app');

const port = process.env.PORT || 3000

function startServer(){
    app.listen(port, ()=>{
        console.log(`Server is Listening at PORT ${port}`)
    })
}
startServer();