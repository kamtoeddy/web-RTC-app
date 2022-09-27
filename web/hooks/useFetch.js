import { useEffect, useState } from "react";

const useFetch = (
  url,
  fetchReady,

  { method, body, ContentType, resourceName, initState } = {
    method: "",
    body: {},
    ContentType: "application/json",
    initState: [],
    resourceName: null,
  }
) => {
  const [data, setData] = useState(initState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    // fetch data only if component ready to fetch data
    if (fetchReady) {
      const config =
        method.toLowerCase() === "GET" || method == ""
          ? {
              signal: abortController.signal,
            }
          : {
              signal: abortController.signal,
              method: method.toUpperCase(),
              body: JSON.stringify(body),
              headers: { "Content-Type": ContentType },
            };

      // setTimeout(() => {
      fetch(url, config)
        .then((response) => {
          if (!response.ok) {
            throw Error(`Could not get ${resourceName || "resource"}`);
          }
          return response.json();
        })
        .then((data) => {
          setData(data);
          setLoading(false);
          setError(null);
        })
        .catch((err) => {
          setLoading(false);
          setError(err.message);
        });
      // }, 500);
    }

    return () => abortController.abort();
  }, [url, fetchReady, resourceName]);

  return { data, loading, error };
};

export default useFetch;
