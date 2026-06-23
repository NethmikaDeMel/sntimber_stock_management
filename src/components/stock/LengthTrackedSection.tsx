// "use client";

// import { Plus, Minus, AlertTriangle } from "lucide-react";
// import type {
//   LengthTrackedEntry,
//   LengthProfile,
//   TimberSpecies,
//   TimberClass,
//   ActionContext,
// } from "@/types/timber";
// import { DIMENSIONAL_SIZES, PLANK_THICKNESSES } from "@/lib/data";

// interface LengthProfileCardProps {
//   profile: LengthProfile;
//   species: TimberSpecies;
//   timberClass: TimberClass;
//   sizeId: string;
//   sizeLabel: string;
//   onAction: (ctx: ActionContext) => void;
// }

// export function LengthProfileCard({
//   profile,
//   species,
//   timberClass,
//   sizeId,
//   sizeLabel,
//   onAction,
// }: LengthProfileCardProps) {
//   const isLow = profile.pieces <= profile.safetyThreshold;
//   const pct = Math.min(
//     Math.round((profile.pieces / (profile.safetyThreshold * 4)) * 100),
//     100
//   );

//   const barColor = isLow
//     ? "var(--color-danger)"
//     : pct < 40
//     ? "var(--color-warning)"
//     : "var(--color-forest-500)";

//   function buildCtx(type: "RESTOCK" | "SALE"): ActionContext {
//     return {
//       species,
//       timberClass,
//       sizeId,
//       sizeLabel,
//       defaultType: type,
//       unit: "pieces",
//       lengthFt: profile.lengthFt,
//     };
//   }

//   return (
//     <div
//       className="card p-4 flex flex-col gap-3 relative overflow-hidden"
//       style={{
//         borderColor: isLow ? "rgba(248,113,113,.35)" : "var(--color-border)",
//       }}
//     >
//       {isLow && (
//         <div
//           className="absolute top-0 left-0 right-0 h-0.5"
//           style={{ background: "var(--color-danger)" }}
//         />
//       )}

//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div
//           className="px-3 py-1 rounded-full text-sm font-bold font-mono"
//           style={{
//             background: "rgba(212,134,42,.12)",
//             color: "var(--color-accent)",
//             border: "1px solid rgba(212,134,42,.25)",
//           }}
//         >
//           {profile.lengthFt} ft Profile
//         </div>
//         {isLow && (
//           <div
//             className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
//             style={{
//               background: "rgba(248,113,113,.12)",
//               color: "var(--color-danger)",
//             }}
//           >
//             <AlertTriangle size={10} />
//             Low
//           </div>
//         )}
//       </div>

//       {/* Stock count */}
//       <div>
//         <p
//           className="font-mono text-2xl font-bold"
//           style={{ color: "var(--color-text-primary)" }}
//         >
//           {profile.pieces}
//           <span
//             className="text-sm font-normal ml-1"
//             style={{ color: "var(--color-text-muted)" }}
//           >
//             pcs
//           </span>
//         </p>
//         <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
//           Min: {profile.safetyThreshold} pcs
//         </p>
//       </div>

//       {/* Bar */}
//       <div
//         className="h-1 rounded-full overflow-hidden"
//         style={{ background: "var(--color-surface-3)" }}
//       >
//         <div
//           className="h-full rounded-full transition-all duration-500"
//           style={{ width: `${pct}%`, background: barColor }}
//         />
//       </div>

//       {/* Actions */}
//       <div className="flex gap-1.5">
//         <button
//           onClick={() => onAction(buildCtx("RESTOCK"))}
//           className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all"
//           style={{
//             background: "rgba(74,222,128,.1)",
//             border: "1px solid rgba(74,222,128,.22)",
//             color: "var(--color-success)",
//           }}
//           onMouseEnter={(e) =>
//             (e.currentTarget.style.background = "rgba(74,222,128,.18)")
//           }
//           onMouseLeave={(e) =>
//             (e.currentTarget.style.background = "rgba(74,222,128,.1)")
//           }
//         >
//           <Plus size={12} /> Restock
//         </button>
//         <button
//           onClick={() => onAction(buildCtx("SALE"))}
//           className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all"
//           style={{
//             background: "rgba(96,165,250,.1)",
//             border: "1px solid rgba(96,165,250,.22)",
//             color: "var(--color-info)",
//           }}
//           onMouseEnter={(e) =>
//             (e.currentTarget.style.background = "rgba(96,165,250,.18)")
//           }
//           onMouseLeave={(e) =>
//             (e.currentTarget.style.background = "rgba(96,165,250,.1)")
//           }
//         >
//           <Minus size={12} /> Sale
//         </button>
//       </div>
//     </div>
//   );
// }

// interface LengthTrackedSectionProps {
//   entry: LengthTrackedEntry;
//   species: TimberSpecies;
//   timberClass: TimberClass;
//   onAction: (ctx: ActionContext) => void;
// }

// export function LengthTrackedSection({
//   entry,
//   species,
//   timberClass,
//   onAction,
// }: LengthTrackedSectionProps) {
//   const sizeList =
//     timberClass === "dimensional" ? DIMENSIONAL_SIZES : PLANK_THICKNESSES;
//   const sizeLabel =
//     sizeList.find((s) => s.id === entry.sizeId)?.label ?? entry.sizeId;

//   const totalPieces = entry.profiles.reduce((acc, p) => acc + p.pieces, 0);

//   return (
//     <div>
//       {/* Section sub-header */}
//       <div className="flex items-center gap-3 mb-3">
//         <span
//           className="font-display text-base font-semibold"
//           style={{ color: "var(--color-text-primary)" }}
//         >
//           {sizeLabel}
//         </span>
//         <span
//           className="text-xs font-mono px-2 py-0.5 rounded"
//           style={{
//             background: "var(--color-surface-2)",
//             color: "var(--color-text-muted)",
//           }}
//         >
//           {totalPieces} pcs total
//         </span>
//       </div>

//       {/* Profile cards grid */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
//         {entry.profiles.map((profile) => (
//           <LengthProfileCard
//             key={`${entry.sizeId}-${profile.lengthFt}`}
//             profile={profile}
//             species={species}
//             timberClass={timberClass}
//             sizeId={entry.sizeId}
//             sizeLabel={sizeLabel}
//             onAction={onAction}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }
