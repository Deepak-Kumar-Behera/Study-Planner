import { createPortal } from 'react-dom';

export const PAGE_SIZE = 6;

export const Pagination = ({ page, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center space-x-2">
      <button
        className="px-3 py-1 rounded bg-blue-100 text-blue-600 disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Prev
      </button>
      <span className="px-3 py-1">Page {page} of {totalPages}</span>
      <button
        className="px-3 py-1 rounded bg-blue-100 text-blue-600 disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
};

export function parseBold(text) {
  if (!text) return '';
  return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
}
