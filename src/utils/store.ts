import {create} from 'zustand';

interface GuidesStore {
    reservationGuides: { [reservationId: string]: any[] };
    setReservationGuides: (reservationId: string, guides: any[]) => void;
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