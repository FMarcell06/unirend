<div align="center">

# Unirend

**Egyetemi órarend-kezelő webalkalmazás – saját órarend, kurzusok és közös nézet barátokkal.**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![imgbb](https://img.shields.io/badge/imgbb-Képfeltöltés-1F9BD1?style=for-the-badge)

</div>

---

## Bemutató

<div align="center">

<img src="https://i.ibb.co/fdLk5T3C/Screenshot-2026-11-27-at-20-18-27.png" alt="Heti nézet" width="90%" />

<br/><br/>

<table>
  <tr>
    <td align="center"><b>Napi nézet (Mobil)</b></td>
    <td align="center"><b>Kurzusok (sötét mód)</b></td>
    <td align="center"><b>Közös nézet</b></td>
  </tr>
  <tr>
    <td><img src="https://i.ibb.co/1t62vcPw/Screenshot-2026-11-27-at-20-19-06.png
    " alt="Napi nézet" width="250" /></td>
    <td><img src="https://i.ibb.co/SXTkkMX2/Screenshot-2026-11-27-at-20-19-20.png
    " alt="Kurzusok" width="250" /></td>
    <td><img src="https://i.ibb.co/mCVZ5Sy8/Screenshot-2026-11-27-at-20-19-41.png" alt="Közös nézet" width="250" /></td>
  </tr>
</table>

</div>

---

## Funkciók

- **Órarend** – átlátható heti és napi nézet, páros/páratlan hét kezeléssel
- **Kurzusok kezelése** – tárgyak hozzáadása, módosítása és törlése (oktató, időpont, típus, terem, egyedi szín)
- **Közös nézet** – a saját órarended összevetése egy hozzáadott ismerősével, külön színekkel jelölve
- **Ismerősök** – barátok keresése és hozzáadása
- **Profilkép feltöltése** – képtárolás [imgbb](https://imgbb.com/) segítségével
- **Világos / sötét téma**
- **Reszponzív felület** – asztali és mobil nézet külön navigációval

---

## Tech stack

| Réteg | Technológia |
|---|---|
| Frontend | [React](https://react.dev/) |
| Backend / Adatbázis / Auth | [Supabase](https://supabase.com/) |
| Képfeltöltés | [imgbb API](https://api.imgbb.com/) |

---

## Telepítés és futtatás

```bash
# 1. Repo klónozása
git clone https://github.com/FMarcell06/unirend.git
cd unirend

# 2. Függőségek telepítése
npm install

# 3. Környezeti változók beállítása (lásd lent)

# 4. Fejlesztői szerver indítása
npm run dev
```

### Környezeti változók

Hozz létre egy `.env` fájlt a projekt gyökerében:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_IMGBB_API_KEY=your_imgbb_api_key
```

> A változók nevei a projekt beállításaitól függően eltérhetnek.

---

## Licenc

Ez a projekt szabadon felhasználható tanulási és személyes célokra.

---

<div align="center">

Készítette: **[Forgó Marcell](https://github.com/FMarcell06)**

</div>