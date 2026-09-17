import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#901CDB]">
          404
        </p>
        <h1 className="mt-3 text-2xl md:text-3xl font-bold text-[#141416]">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-3 text-sm md:text-base text-[#777E90]">
          The link may be out of date, or the page may have moved.
        </p>
        <Link
          to="/"
          className="inline-block mt-8 px-8 py-3 bg-[#901CDB] text-white rounded-lg text-base font-medium hover:bg-[#7A16C0] transition-colors"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
