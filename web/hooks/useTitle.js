import { useEffect } from "react";

const useTitle = (title) => {
  const baseTitle = process.env.NEXT_PUBLIC_DOC_BASE_TITLE;

  useEffect(() => {
    document.title = `${baseTitle} | ${title}`;
    return () => (document.title = baseTitle);
  }, [title]);
};

export default useTitle;
