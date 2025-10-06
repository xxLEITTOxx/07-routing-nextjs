"use client";

import NoteList from "@/components/NoteList/NoteList";
import css from "./NotesPage.module.css";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api";
import type { FetchNotesResponse } from "@/lib/api";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import Modal from "@/components/Modal/Modal";
import NoteForm from "@/components/NoteForm/NoteForm";
import { useDebounce } from "use-debounce";
import { NoteTag } from "@/types/note";

interface Props {
  search: string;
  page: number;
  tag?: NoteTag | undefined;
}

export default function NotesClient({ search, page, tag }: Props) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [query, setQuery] = useState(search);
  const [debouncedQuery] = useDebounce(query, 500);
  const [currentPage, setCurrentPage] = useState(page);

  const { data, isLoading, error } = useQuery<FetchNotesResponse>({
    queryKey: ["notes", debouncedQuery, currentPage, tag],
    queryFn: () =>
      fetchNotes({
        search: debouncedQuery,
        page: currentPage,
        perPage: 12,
        tag: tag,
      }),
    enabled: true,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery]);

  const handleSearch = (value: string) => {
    setQuery(value);
    setCurrentPage(1);
    console.log("searching for", value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <div className={css.app}>
        <header className={css.toolbar}>
          {/* Компонент SearchBox */}
          {<SearchBox handleSearch={handleSearch} />}
          {/* Пагінація */}
          {/* условие что рендер будет в случае если в коллекции будет 1+ компонент */}
          {data && data.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
            />
          )}

          {/* Кнопка створення нотатки */}
          <button className={css.button} onClick={() => setIsOpenModal(true)}>
            Create note +
          </button>
        </header>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error loading notes</p>}
        {data && data.notes.length > 0 ? (
          <NoteList notes={data.notes} />
        ) : (
          <p>No notes found</p>
        )}
      </div>
      {isOpenModal && (
        <Modal onClose={() => setIsOpenModal(false)}>
          <NoteForm onCancel={() => setIsOpenModal(false)} />
        </Modal>
      )}
    </>
  );
}
