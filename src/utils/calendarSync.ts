import axios from 'axios';


export const syncSingleReservation = async (reservationId: string, userId: string): Promise<boolean> => {
  try {
    const authStatusResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/auth-status/${userId}`,
      { withCredentials: true }
    );
    
    if (!authStatusResponse.data.isAuthorized) {
      console.error('User has not authorized Google Calendar');
      return false;
    }

    const reservationResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservationId}`,
      { withCredentials: true }
    );
    
    if (!reservationResponse.data) {
      console.error('Could not fetch reservation details');
      return false;
    }
    
    const reservation = reservationResponse.data;

    let tenantName = '';
    try {
      const tenantResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/tenants/${reservation.tenantId}`,
        { withCredentials: true }
      );
      if (tenantResponse.data) {
        tenantName = tenantResponse.data.name;
      }
    } catch (error) {
      console.error('Error fetching tenant:', error);
      tenantName = 'Default Location';
    }

    let additionalInfo = [];
    try {
      const additionalResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/additional-information/tour/${reservation.tourId}`,
        { withCredentials: true }
      );
      if (additionalResponse.data) {
        additionalInfo = additionalResponse.data;
      }
    } catch (error) {
      console.error('Error fetching additional information:', error);
    }

    let customerResponses = [];
    try {
      const responsesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/customer-additional-information?reservationId=${reservationId}`,
        { withCredentials: true }
      );
      if (responsesResponse.data) {
        customerResponses = responsesResponse.data;
      }
    } catch (error) {
      console.error('Error fetching customer responses:', error);
    }

    let guides = [];
    try {
      const guidesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/guides/reservations/${reservationId}/guides`,
        { withCredentials: true }
      );
      if (guidesResponse.data) {
        guides = guidesResponse.data;
      }
    } catch (error) {
      console.error('Error fetching guides:', error);
    }

    let purchaseNotes = [];
    try {
      const notesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/purchase-notes/${reservationId}`,
        { withCredentials: true }
      );
      if (notesResponse.data) {
        purchaseNotes = notesResponse.data;
      }
    } catch (error) {
      console.error('Error fetching purchase notes:', error);
    }

    let additionalInfoText = '';
    if (additionalInfo.length > 0 && customerResponses.length > 0) {
      additionalInfoText = '\n\nAdditional Information:';
      for (const info of additionalInfo) {
        const response = customerResponses.find(
          resp => resp.additionalInformationId === info.id
        );
        additionalInfoText += `\n${info.title}: ${response?.value || 'No response'}`;
      }
    }

    let guidesText = '';
    if (guides.length > 0) {
      guidesText = '\nGuides: ';
      guidesText += guides.map(guide => guide.guide?.name || 'Unknown Guide').join(', ');
    }

    let notesText = '';
    if (purchaseNotes.length > 0) {
      notesText = '\n\nPurchase Notes:';
      for (const note of purchaseNotes) {
        notesText += `\n- ${note.description}`;
      }
    }

    const startTime = new Date(reservation.reservation_date);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + (reservation.tour?.duration || 60));
    
    const reservationData = {
      id: reservationId,
      title: `${reservation.tour?.name || 'Tour'} - ${reservation.user?.name || 'Guest'}`,
      description: `Guest: ${reservation.user?.name || 'N/A'}
Email: ${reservation.user?.email || 'N/A'}
Phone: ${reservation.user?.phone || 'N/A'}
Guests: ${reservation.guestQuantity}
Status: ${reservation.status}${guidesText}${additionalInfoText}${notesText}`,
      startTime,
      endTime,
      tenantId: reservation.tenantId
    };

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/sync-by-tenant`,
      { 
        userId,
        reservationsByTenant: {
          [tenantName]: [reservationData]
        }
      },
      { withCredentials: true }
    );
    
    if (response.data) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error syncing reservation with calendar:', error);
    
    try {
      const reservationResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservationId}`,
        { withCredentials: true }
      );
      
      if (!reservationResponse.data) {
        return false;
      }
      
      const reservation = reservationResponse.data;
      const startTime = new Date(reservation.reservation_date);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + (reservation.tour?.duration || 60));

      let guidesText = '';
      try {
        const guidesResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/guides/reservations/${reservationId}/guides`,
          { withCredentials: true }
        );
        if (guidesResponse.data && guidesResponse.data.length > 0) {
          guidesText = '\nGuides: ';
          guidesText += guidesResponse.data.map(guide => guide.guide?.name || 'Unknown Guide').join(', ');
        }
      } catch (error) {
        console.error('Error fetching guides:', error);
      }

      let notesText = '';
      try {
        const notesResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/purchase-notes/${reservationId}`,
          { withCredentials: true }
        );
        if (notesResponse.data && notesResponse.data.length > 0) {
          notesText = '\n\nPurchase Notes:';
          for (const note of notesResponse.data) {
            notesText += `\n- ${note.description}`;
          }
        }
      } catch (error) {
        console.error('Error fetching purchase notes:', error);
      }
      
      const reservationData = {
        id: reservationId,
        title: `${reservation.tour?.name || 'Tour'} - ${reservation.user?.name || 'Guest'}`,
        description: `Guest: ${reservation.user?.name || 'N/A'}
Email: ${reservation.user?.email || 'N/A'}
Phone: ${reservation.user?.phone || 'N/A'}
Guests: ${reservation.guestQuantity}
Status: ${reservation.status}${guidesText}${notesText}`,
        startTime,
        endTime
      };
      
      const fallbackResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/sync`,
        { 
          userId,
          reservations: [reservationData]
        },
        { withCredentials: true }
      );
      
      return !!fallbackResponse.data;
    } catch (fallbackError) {
      console.error('Fallback sync also failed:', fallbackError);
      return false;
    }
  }
};

export const syncReservationForGuides = async (reservationId: string): Promise<boolean> => {
  try {
    const guidesResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/guides/reservations/${reservationId}/guides`,
      { withCredentials: true }
    );
    
    if (!guidesResponse.data || !guidesResponse.data.length) {
      return false;
    }
    
    const guides = guidesResponse.data;
    let synced = false;
    for (const guide of guides) {
      try {
        const authStatusResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/auth-status/${guide.guideId}`,
          { withCredentials: true }
        );
        
        if (authStatusResponse.data.isAuthorized) {
          const success = await syncSingleReservation(reservationId, guide.guideId);
          if (success) synced = true;
        } else {
          console.error('Guide has not authorized calendar access:', guide.guideId);
        }
      } catch (error) {
        console.error(`Error syncing calendar for guide ${guide.guideId}:`, error);
      }
    }
    
    return synced;
  } catch (error) {
    console.error('Error syncing calendar for guides:', error);
    return false;
  }
};

export const syncAfterGuideAssignment = async (reservationId: string, addedGuideIds: string[] = [], removedGuideIds: string[] = []): Promise<void> => {
  try {
    for (const guideId of addedGuideIds) {
      try {
        const authStatusResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/auth-status/${guideId}`,
          { withCredentials: true }
        );
        
        if (authStatusResponse.data.isAuthorized) {
          await syncSingleReservation(reservationId, guideId);
        }
      } catch (error) {
        console.error(`Error adding calendar event for guide ${guideId}:`, error);
      }
    }

    for (const guideId of removedGuideIds) {
      try {
        const authStatusResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/auth-status/${guideId}`,
          { withCredentials: true }
        );
        
        if (authStatusResponse.data.isAuthorized) {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/remove-event`,
            {
              userId: guideId,
              reservationId: reservationId
            },
            { withCredentials: true }
          );
        }
      } catch (error) {
        console.error(`Error removing calendar event for guide ${guideId}:`, error);
      }
    }
    await syncReservationForGuides(reservationId);
  } catch (error) {
    console.error('Error in syncAfterGuideAssignment:', error);
  }
};

export const syncAfterNotesChange = async (reservationId: string): Promise<void> => {
  try {
    const reservationResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservationId}`,
      { withCredentials: true }
    );
    
    if (!reservationResponse.data) {
      console.error('Could not fetch reservation details for notes sync');
      return;
    }
    
    const reservation = reservationResponse.data;

    if (reservation.userId) {
      try {
        const authStatusResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/auth-status/${reservation.userId}`,
          { withCredentials: true }
        );
        
        if (authStatusResponse.data.isAuthorized) {
          await syncSingleReservation(reservationId, reservation.userId);
        }
      } catch (error) {
        console.error(`Error updating calendar for reservation owner:`, error);
      }
    }

    await syncReservationForGuides(reservationId);
  } catch (error) {
    console.error('Error syncing calendar after notes change:', error);
  }
};

export const authorizeGoogleCalendar = async (): Promise<string> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/auth-url`,
      { withCredentials: true }
    );
    
    return response.data.authUrl;
  } catch (error) {
    console.error('Error getting auth URL:', error);
    throw error;
  }
}; 