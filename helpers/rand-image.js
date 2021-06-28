module.exports = (sex) => {
    if (sex == 'male') {

        const rand  = Math.floor( Math.random() * 5) + 1;
        return  'uploads/userImage/' + rand.toString() + '.svg'


    } else if (sex == 'female') {
        const rand  = Math.floor( Math.random() * 5) + 6;

        return  'uploads/userImage/' + rand.toString() + '.svg'

    } else {
        const rand  = Math.floor( Math.random() * 5) + 11;

        return  'uploads/userImage/' + rand.toString() + '.svg'

    }
}