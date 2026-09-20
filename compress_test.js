const uint8ToBase64 = (u8Arr) => {
    let CHUNK_SIZE = 0x8000;
    let index = 0;
    let length = u8Arr.length;
    let result = '';
    while (index < length) {
        let slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
        result += String.fromCharCode.apply(null, slice);
        index += CHUNK_SIZE;
    }
    return btoa(result);
};

const LZW = {
    compress: (uncompressed) => {
        if (!uncompressed) return "";
        const dict = new Map();
        for (let i = 0; i < 256; i++) dict.set(String.fromCharCode(i), i);
        let c = uncompressed.charAt(0);
        let res = [];
        let dictSize = 256;
        for (let i = 1; i < uncompressed.length; i++) {
            let wc = c + uncompressed.charAt(i);
            if (dict.has(wc)) { c = wc; }
            else {
                res.push(dict.get(c));
                dict.set(wc, dictSize++);
                c = String(uncompressed.charAt(i));
            }
        }
        if (c !== "") res.push(dict.get(c));
        return uint8ToBase64(new Uint8Array(new Uint16Array(res).buffer));
    },
    decompress: (compressedBase64) => {
        if (!compressedBase64) return "";
        try {
            const buffer = new Uint16Array(Uint8Array.from(atob(compressedBase64), c => c.charCodeAt(0)).buffer);
            const compressed = Array.from(buffer);
            const dict = new Map();
            for (let i = 0; i < 256; i++) dict.set(i, String.fromCharCode(i));
            let w = String.fromCharCode(compressed[0]);
            let res = w;
            let dictSize = 256;
            for (let i = 1; i < compressed.length; i++) {
                let entry = "";
                const k = compressed[i];
                if (dict.has(k)) entry = dict.get(k);
                else if (k === dictSize) entry = w + w.charAt(0);
                else return null;
                res += entry;
                dict.set(dictSize++, w + entry.charAt(0));
                w = entry;
            }
            return res;
        } catch { return compressedBase64; } 
    }
};

const packLogs = (logs) => {
    const tuples = logs.map(l => [l.date, l.entry, l.logged_at]);
    return "LZW:" + LZW.compress(JSON.stringify(tuples));
};

const unpackLogs = (packed) => {
    if (!packed) return [];
    if (typeof packed !== 'string') return packed;
    
    let rawJson = packed;
    if (packed.startsWith("LZW:")) {
        rawJson = LZW.decompress(packed.slice(4));
    }
    
    try {
        const parsed = JSON.parse(rawJson);
        return parsed.map(item => Array.isArray(item) ? { date: item[0], entry: item[1], logged_at: item[2] } : item);
    } catch {
        return [];
    }
};

let data = [];
for(let i=0; i<100; i++) data.push({date: "2023-01-01", entry: "Reviewed contract for client " + i + ". Read 50 pages of depositions. Drafted summary.", logged_at: new Date().toISOString()});

const orig = JSON.stringify(data).length;
const packed = packLogs(data);
console.log("Original: " + orig + " bytes");
console.log("Packed: " + packed.length + " bytes (" + (packed.length / orig * 100).toFixed(1) + "%)");
console.log(unpackLogs(packed).length === 100 ? "Valid" : "Invalid");
