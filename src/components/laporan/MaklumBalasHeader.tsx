interface Props {
  namaSekolah: string;
}

export function MaklumBalasHeader({ namaSekolah }: Props) {
  return (
    <div className="mb-logo-header">
      <div className="mb-logo-side">
        <img
          src="/logo-sekolah.png"
          alt="Logo Sekolah"
          className="mb-logo-img"
        />
      </div>
      <div className="mb-logo-center">
        <p className="mb-logo-school">{namaSekolah.toUpperCase()}</p>
        <h1 className="mb-logo-title">BORANG MAKLUM BALAS PENCERAPAN</h1>
      </div>
      <div className="mb-logo-side mb-logo-side-right">
        <img src="/logo-jata.png" alt="Jata Negara" className="mb-logo-img" />
      </div>
    </div>
  );
}