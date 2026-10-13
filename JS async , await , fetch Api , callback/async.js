// console.log('Hello from async.js');
// console.log('This message appears in the browser console.');

// const name = 'Ahmed';
// console.log('Welcome, ' + name);
// console.log('Welcome, ' + name);

// promises ----------------------------------------------
const promise = new Promise((resolve , reject) => {
    const allpro = false
    if (allpro) {
        resolve ('Yes')
    }else {
        reject ('No')
    }
});
promise
.then ((message) => {
    console.log(message)
})
.catch((error) => {
    console.log (error)
})