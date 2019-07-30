import gql from 'graphql-tag';

export const GET_TRIPS = gql`
query getTrips{
  getTrips{
     agenda{
      day
      dayTitle
      imageUrl
      agenda
    }
    couponCodes{
      id
      code
      discountType
      discountAmount
      appliesToNumberOfGuests
      appliesToExcursions
    }
    dates{
      days
      end
      start
      status
    }
    description
    id
    location{
      cityOrRegion
      country
      description
    }
    hotel{
      description
      rooms{
        pricing{
          pricePerRoom
          pricePerRoomPerPerson
          downPayment
          downPaymentPerPerson
          extraPricePerNight
          extraPricePerNightPerPerson
        }
      }
      totalRooms
      totalRoomsRemaining
      property
    }
    includes
    title
  }
}
`;