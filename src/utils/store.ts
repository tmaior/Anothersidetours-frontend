import {create} from 'zustand';

export interface Guide {
    id: string;
    name: string;
    email: string;
}

export interface GuidesStore {
    reservationGuides: { [reservationId: string]: Guide[] };
    setReservationGuides: (reservationId: string, guides: Guide[]) => void;
    removeReservationGuides: (reservationId: string) => void;
}

const useGuidesStore = create<GuidesStore>((set) => ({
    reservationGuides: {},

    setReservationGuides: (reservationId, guides) =>
        set((state) => ({
            reservationGuides: {
                ...state.reservationGuides,
                [reservationId]: guides,
            },
        })),

    removeReservationGuides: (reservationId) =>
        set((state) => {
            const newReservationGuides = {...state.reservationGuides};
            delete newReservationGuides[reservationId];
            return {reservationGuides: newReservationGuides};
        }),
}));

export default useGuidesStore;