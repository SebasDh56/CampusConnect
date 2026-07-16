import campusConnectLogo from "../assets/campus-connect-logo.png";

export function Topbar() {
  return (
    <header className="topbar">
      <p className="topbar-title">Operaciones institucionales</p>
      <img className="topbar-logo" src={campusConnectLogo} alt="Campus Connect" />
    </header>
  );
}
