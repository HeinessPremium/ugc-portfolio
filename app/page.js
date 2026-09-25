import { readManifest, CATEGORIES } from "@/lib/manifest";

export const dynamic = "force-dynamic";

export default async function Home() {
  const manifest = await readManifest();
  const videos = manifest.videos || [];

  return (
    <>
      <header className="hero">
        <div className="kicker">Eniolamide O. — AI UGC Creator</div>
        <h1>AI-generated video that feels shot by a real person.</h1>
        <p className="pitch">
          Scroll-stopping UGC, product films and short story-style ads — made
          with AI, built to convert like a friend&apos;s recommendation.
        </p>
      </header>

      {CATEGORIES.map((cat) => {
        const items = videos.filter((v) => v.category === cat.id);
        return (
          <section className="category" key={cat.id}>
            <div className="cat-head">
              <h2>{cat.label}</h2>
            </div>
            {items.length === 0 ? (
              <p className="empty-note">Nothing added here yet.</p>
            ) : (
              <div className="reel">
                {items.map((v) => (
                  <div className="card" key={v.id}>
                    <video src={v.url} controls playsInline preload="metadata" />
                    <div className="label">{v.label || "Untitled"}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <footer>
        <h2>Let&apos;s make your next ad feel human.</h2>
        <div className="contact-row">
          <a href="mailto:justeniolamide@gmail.com">justeniolamide@gmail.com</a>
          <a href="tel:+2347068437700">+234 706 843 7700</a>
        </div>
      </footer>
    </>
  );
}
