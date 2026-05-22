import type { PromotionItem } from "../services/api";

interface PromoSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotions: PromotionItem[];
  onSelectPromo: (promo: PromotionItem) => void;
}

export const PromoSelectionModal = ({
  isOpen,
  onClose,
  promotions,
  onSelectPromo,
}: PromoSelectionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-bold">Chọn mã giảm giá</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            Đóng
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-4">
          {promotions.length === 0 ? (
            <p className="text-gray-500">Không có mã giảm giá khả dụng.</p>
          ) : (
            promotions.map(promo => (
              <div key={promo.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{promo.code}</p>
                    <p className="mt-2 text-base font-bold text-slate-900">{promo.discountText}</p>
                    <p className="mt-1 text-sm text-slate-600">{promo.description}</p>
                    <p className="mt-1 text-xs text-slate-400">HSD: {promo.endDate}</p>
                  </div>
                  <button
                    onClick={() => onSelectPromo(promo)}
                    className="rounded-full bg-black px-5 py-2 text-sm font-semibold uppercase text-white hover:bg-gray-900"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
