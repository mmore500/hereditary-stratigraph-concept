#pragma once
#ifndef DISH2_WEB_VIEWERCOLLECTION_HPP_INCLUDE
#define DISH2_WEB_VIEWERCOLLECTION_HPP_INCLUDE

#include <tuple>

#include "../viz/artists/_index.hpp"

#include "GridViewer.hpp"
#include "SeriesViewer.hpp"
#include "viewer_categories/_index.hpp"
#include "ViewerManager.hpp"

namespace dish2 {

template<typename Spec>
using ViewerCollection = dish2::ViewerManager<
  dish2::GridViewer<
    Spec,
    dish2::ApoptosisRequestArtist<Spec>,
    dish2::ApoptosisCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::CellBirthArtist<Spec>,
    dish2::ApoptosisCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::DistanceToGraphCenterArtist<Spec>,
    dish2::ApoptosisCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::EpochArtist<Spec>,
    dish2::DemographicsCategory
  >,
  dish2::SeriesViewer<
    Spec,
    dish2::ExpressionByModuleArtist<Spec>,
    dish2::GroupStructureCategory,
    16
  >,
  dish2::GridViewer<
    Spec,
    dish2::HeirRequestArtist<Spec>,
    dish2::SharingCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::IncomingInterMessageCounterArtist<Spec>,
    dish2::MessagingCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::IncomingIntraMessageCounterArtist<Spec>,
    dish2::MessagingCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::IsAliveArtist<Spec>,
    dish2::DemographicsCategory
  >,
  dish2::SeriesViewer<
    Spec,
    dish2::PeripheralityLevArtist<Spec>,
    dish2::GroupStructureCategory,
    Spec::NLEV
  >,
  dish2::SeriesViewer<
    Spec,
    dish2::KinGroupAgeArtist<Spec>,
    dish2::DemographicsCategory,
    Spec::NLEV
  >,
  dish2::GridViewer<
    Spec,
    dish2::KinGroupIDArtist<Spec>,
    dish2::GroupStructureCategory,
    true
  >,
  dish2::SeriesViewer<
    Spec,
    dish2::KinGroupIDLevArtist<Spec>,
    dish2::GroupStructureCategory,
    Spec::NLEV
  >,
  dish2::GridViewer<
    Spec,
    dish2::KinGroupIDViewArtist<Spec>,
    dish2::GroupStructureCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::KinMatchArtist<Spec>,
    dish2::GroupStructureCategory
  >,
  dish2::SeriesViewer<
    Spec,
    dish2::LearnedQuorumBitArtist<Spec>,
    dish2::GroupStructureCategory,
    Spec::NLEV
  >,
  dish2::SeriesViewer<
    Spec,
    dish2::LearnedQuorumBitsArtist<Spec>,
    dish2::GroupStructureCategory,
    Spec::NLEV
  >,
  dish2::GridViewer<
    Spec,
    dish2::MostRecentCauseOfDeathArtist<Spec>,
    dish2::DemographicsCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::NeighborKinGroupIDViewArtist<Spec>,
    dish2::GroupStructureCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::NeighborPosArtist<Spec>,
    dish2::GroupStructureCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::NumBusyCoresArtist<Spec>,
    dish2::GroupStructureCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::NumModulesArtist<Spec>,
    dish2::GroupStructureCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::PcaBinaryExpressionArtist<Spec>,
    dish2::GroupStructureCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::PcaExpressionArtist<Spec>,
    dish2::GroupStructureCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::PcaRegulationArtist<Spec>,
    dish2::GroupStructureCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::PcaTrinaryRegulationArtist<Spec>,
    dish2::GroupStructureCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::PhylogeneticRootArtist<Spec>,
    dish2::DemographicsCategory
  >,
  dish2::SeriesViewer<
    Spec,
    dish2::QuorumBitArtist<Spec>,
    dish2::GroupStructureCategory,
    Spec::NLEV
  >,
  dish2::SeriesViewer<
    Spec,
    dish2::QuorumBitOwnArtist<Spec>,
    dish2::GroupStructureCategory,
    Spec::NLEV
  >,
  dish2::SeriesViewer<
    Spec,
    dish2::QuorumBitsArtist<Spec>,
    dish2::GroupStructureCategory,
    Spec::NLEV
  >,
  dish2::SeriesViewer<
    Spec,
    dish2::QuorumCapArtist<Spec>,
    dish2::GroupStructureCategory,
    Spec::NLEV
  >,
  dish2::SeriesViewer<
    Spec,
    dish2::RegulationByModuleArtist<Spec>,
    dish2::SharingCategory,
    16
  >,
  dish2::SeriesViewer<
    Spec,
    dish2::RegulationExposedByModuleArtist<Spec>,
    dish2::SharingCategory,
    16
  >,
  dish2::GridViewer<
    Spec,
    dish2::ResourceInputPeekArtist<Spec>,
    dish2::SharingCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::ResourceStockpileArtist<Spec>,
    dish2::SharingCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::SpawnArrestArtist<Spec>,
    dish2::SharingCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::SpawnedFromArtist<Spec>,
    dish2::GroupStructureCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::SpawnRequestArtist<Spec>,
    dish2::SharingCategory
  >,
  dish2::GridViewer<
    Spec,
    dish2::TaxaArtist<Spec>,
    dish2::SharingCategory
  >
>;

} // namespace dish2

#endif // #ifndef DISH2_WEB_VIEWERCOLLECTION_HPP_INCLUDE
