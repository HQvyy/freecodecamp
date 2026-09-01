function isPrime(number){

    // bilangan prima lebih dari 1
    if(number <= 1) return false;

    // angka 2 dan 3 adalah bilangan prima
    if(number <= 3 ) return true;

    if(number % 2 === 0 || number % 3 === 0) return false

    // mencari angka lainnya
    for (let i = 5; i * i <= number; i += 6) {
        if (number % i === 0 || number % (i + 2) === 0) return false;
    }

    return true
}

module.exports = {isPrime}