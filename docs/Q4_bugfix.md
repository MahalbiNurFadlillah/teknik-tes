# Analisis & Penjelasan Perbaikan Bug (Q4)

## Ringkasan Masalah

Pada fungsi `getTotalUsageMB`, tujuan utama kode adalah menghitung total penggunaan data dalam megabyte (MB) dari sekumpulan data pemakaian pelanggan menggunakan metode `Array.prototype.reduce()`. Namun, fungsi tersebut mengalami kegagalan dan menghasilkan nilai `NaN` (Not a Number) karena terdapat kesalahan logika dasar pada penulisan fungsi callback serta ketidakberadaan nilai awal akumulator.

---

## Analisis Akar Penyebab Bug

Akar penyebab utama dari bug ini terletak pada dua hal. Pertama, fungsi panah (*arrow function*) di dalam callback `.reduce()` ditulis menggunakan kurung kurawal `{ }` yang membentuk *block body*. Pada penulisan *block body*, JavaScript tidak mengembalikan nilai secara otomatis. Karena pengembang lupa menambahkan perintah `return`, callback tersebut selalu mengembalikan nilai `undefined`. Akibatnya, pada iterasi kedua dan seterusnya, variabel akumulator `total` bernilai `undefined`, sehingga operasi penjumlahan `undefined += record.dataUsageMB` secara matematis menghasilkan nilai `NaN`.

Masalah kedua adalah ketiadaan nilai awal (*initial value*) sebagai argumen kedua pada fungsi `.reduce()`. Ketika nilai awal tidak ditentukan, JavaScript secara otomatis menjadikan elemen pertama dari array `records` sebagai nilai awal variabel `total`. Karena elemen pertama berupa objek record (misalnya `{ subscriberId: 'SUB01', dataUsageMB: 1500 }`), operasi penjumlahan di iterasi awal menjadi tidak valid karena mencoba menjumlahkan objek dengan angka. Selain itu, kondisi ini juga akan menyebabkan aplikasi mengalami *crash* apabila array `records` yang dimasukkan dalam keadaan kosong.

---

## Solusi & Kode Perbaikan

Untuk memperbaiki bug ini, kita perlu memastikan callback mengembalikan hasil penjumlahan pada setiap iterasi dan memberikan angka `0` sebagai nilai awal akumulator. 

Penulisan dapat dilakukan secara eksplisit dengan menambahkan perintah `return` dan argumen `, 0` sebagai berikut:

```javascript
function getTotalUsageMB(records) {
  return records.reduce((total, record) => {
    return total + record.dataUsageMB;
  }, 0);
}
```

Atau, dapat ditulis dengan sintaks yang lebih ringkas menggunakan *implicit return* tanpa kurung kurawal:

```javascript
function getTotalUsageMB(records) {
  return records.reduce((total, record) => total + record.dataUsageMB, 0);
}
```

Dengan perubahan ini, akumulator diawali dari angka `0`, dan setiap iterasi dengan benar menambahkan `dataUsageMB` ke dalam `total` serta meneruskan hasilnya ke iterasi berikutnya hingga diperoleh total penggunaan data yang akurat.

---

## Strategi Pencegahan di Masa Depan

Untuk mencegah munculnya bug serupa di kemudian hari, tim pengembang disarankan menerapkan beberapa langkah preventif. Pertama, mengintegrasikan alat analisis kode statis seperti **ESLint** dengan mengaktifkan aturan `array-callback-return`, sehingga editor akan langsung memberi peringatan jika terdapat fungsi `.reduce()`, `.map()`, atau `.filter()` yang lupa mengembalikan nilai.

Kedua, mewajibkan penggunaan **TypeScript** atau penetapan standar koding yang selalu menentukan *initial value* pada fungsi `.reduce()`. Langkah ini memastikan kejelasan tipe data sejak tahap kompilasi dan mencegah kesalahan saat memproses array kosong. Terakhir, menerapkan pengujian unit (**Unit Testing**) menggunakan framework seperti Jest untuk menguji fungsi penjumlahan pada berbagai skenario masukan, seperti array kosong, array tunggal, maupun array dengan banyak data.
