
const prime = new Uint32Array([2654435761, 2246822519, 3266489917, 668265263, 374761393])

function xxHash32(data, seed = 0) {
    let result = new Uint32Array(1)
    let offset = 0

    if (data.length < 16)
        result[0] = seed + prime[4]
    else {
        const accumulators = new Uint32Array([seed + prime[0] + prime[1], seed + prime[1], seed, seed - prime[0]])

        const limit = Math.ceil((data.length - 16) / 16) * 16
        while (offset < limit)
            for (let lane = 0; lane < 4; lane++) {
                accumulators[lane] += MULT(prime[1], data[offset++], data[offset++], data[offset++], data[offset++])
                accumulators[lane] = MULT(prime[0], ROTL(accumulators[lane], 13))
            }

        result[0] = ROTL(accumulators[0], 1) + ROTL(accumulators[1], 7) + ROTL(accumulators[2], 12) + ROTL(accumulators[3], 18)
    }

    result[0] += data.length


    const limit = Math.floor(data.length / 4) * 4
    while (offset < limit) {
        result[0] += MULT(prime[2], data[offset++], data[offset++], data[offset++], data[offset++])
        result[0] = MULT(prime[3], ROTL(result[0], 17))
    }

    while (offset < data.length) {
        result[0] += prime[4] * data[offset++]
        result[0] = MULT(prime[0], ROTL(result[0], 11))
    }

    result[0] ^= result[0] >>> 15
    result[0] = MULT(prime[1], result[0])
    result[0] ^= result[0] >>> 13
    result[0] = MULT(prime[2], result[0])
    result[0] ^= result[0] >>> 16

    return result
}

function ROTL(data, shift) {
    return (data << shift) | (data >>> (32 - shift))
}

function MULT(multiply, ...data) {
    let a, b
    switch (data.length) {
        case 4: a = data[0] | (data[1] << 8), b = (data[2] | (data[3] << 8)); break;
        case 2: a = data[0], b = data[1]; break;
        case 1: a = data[0] & 0xffff, b = data[0] >>> 16; break;
    }

    return a * multiply + ((b * multiply) << 16)
}