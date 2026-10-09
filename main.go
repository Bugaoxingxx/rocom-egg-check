package main

import (
	"embed"
	"encoding/json"
	"log"
	"strings"

	"github.com/egoist/mygo"
)

//go:embed data/pets.json
var embeddedData embed.FS

type database struct {
	Pets []Pet `json:"pets"`
}

// EggData serves the independent creature and egg-weight dataset to the UI.
type EggData struct {
	pets      []Pet
	eggGroups []string
}

// EggWeight contains the egg weight intervals used in a creature card.
type EggWeight struct {
	Min             int    `json:"min"`
	MiniMax         int    `json:"mini_max"`
	HugeMin         int    `json:"huge_min"`
	Max             int    `json:"max"`
	MiniInterval    int    `json:"mini_interval"`
	HugeInterval    int    `json:"huge_interval"`
	MiniTiers       int    `json:"mini_tiers"`
	HugeTiers       int    `json:"huge_tiers"`
	TotalRange      int    `json:"total_range"`
	Tier            int    `json:"tier"`
	TierLabel       string `json:"tier_label"`
	IntervalCount1G int    `json:"interval_count_1g"`
}

// Pet is one initial form and the information shown in a result card.
type Pet struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Number      string    `json:"number"`
	EvolutionID string    `json:"evolution_id"`
	Stage       int       `json:"stage"`
	EggGroups   []string  `json:"egg_groups"`
	EggGroupIDs []int     `json:"egg_group_ids"`
	EggWeight   EggWeight `json:"egg_weight"`
	Attributes  []string  `json:"attributes"`
}

// QueryFilter selects initial forms by name or number, tier, egg group, and attribute.
type QueryFilter struct {
	Keyword    string   `json:"keyword"`
	MinTier    int      `json:"minTier"`
	MaxTier    int      `json:"maxTier"`
	EggGroups  []string `json:"eggGroups"`
	Attributes []string `json:"attributes"`
}

// NewEggData loads the bundled dataset and preserves its source order.
func NewEggData() (*EggData, error) {
	contents, err := embeddedData.ReadFile("data/pets.json")
	if err != nil {
		return nil, err
	}

	var source database
	if err := json.Unmarshal(contents, &source); err != nil {
		return nil, err
	}

	service := &EggData{}
	seenGroups := make(map[string]bool)
	for _, pet := range source.Pets {
		if pet.Stage != 1 {
			continue
		}
		service.pets = append(service.pets, pet)
		for _, group := range pet.EggGroups {
			if group != "" && !seenGroups[group] {
				seenGroups[group] = true
				service.eggGroups = append(service.eggGroups, group)
			}
		}
	}
	return service, nil
}

// GetEggGroups returns the egg groups in the order they first appear in the dataset.
func (data *EggData) GetEggGroups() []string {
	return append([]string{}, data.eggGroups...)
}

// Query returns initial forms that match all active filters.
func (data *EggData) Query(filter QueryFilter) []Pet {
	minTier, maxTier := filter.MinTier, filter.MaxTier
	if minTier < 1 {
		minTier = 1
	}
	if maxTier < 1 || maxTier > 10 {
		maxTier = 10
	}
	if minTier > maxTier {
		minTier, maxTier = maxTier, minTier
	}

	keyword := strings.TrimSpace(filter.Keyword)
	numericKeyword := isNumber(keyword)
	if numericKeyword && len(keyword) < 3 {
		keyword = strings.Repeat("0", 3-len(keyword)) + keyword
	}
	keywordLower := strings.ToLower(keyword)
	eggGroups := makeSet(filter.EggGroups)
	attributes := makeSet(filter.Attributes)

	results := make([]Pet, 0)
	for _, pet := range data.pets {
		if pet.EggWeight.Tier < minTier || pet.EggWeight.Tier > maxTier {
			continue
		}
		if keyword != "" {
			if numericKeyword {
				if pet.Number != keyword {
					continue
				}
			} else if !strings.Contains(strings.ToLower(pet.Name), keywordLower) {
				continue
			}
		}
		if len(eggGroups) > 0 && !containsAny(pet.EggGroups, eggGroups) {
			continue
		}
		if len(attributes) > 0 && !containsAny(pet.Attributes, attributes) {
			continue
		}
		results = append(results, pet)
	}
	return results
}

func isNumber(value string) bool {
	if value == "" {
		return false
	}
	for _, char := range value {
		if char < '0' || char > '9' {
			return false
		}
	}
	return true
}

func makeSet(values []string) map[string]struct{} {
	set := make(map[string]struct{}, len(values))
	for _, value := range values {
		if value != "" {
			set[value] = struct{}{}
		}
	}
	return set
}

func containsAny(values []string, options map[string]struct{}) bool {
	for _, value := range values {
		if _, found := options[value]; found {
			return true
		}
	}
	return false
}

func main() {
	mygo.App.SetName("NCR Egg Check")
	data, err := NewEggData()
	if err != nil {
		log.Fatal(err)
	}
	mygo.Bind(data)
	mygo.App.WhenReady(func() {
		mygo.NewWindow(mygo.WindowOptions{
			Title:           "蛋查查 · NCR Egg Check",
			URL:             "/",
			Width:           1440,
			Height:          920,
			MinWidth:        720,
			MinHeight:       600,
			StateKey:        "main",
			BackgroundColor: "#e7eadb",
		})
	})
	if err := mygo.App.Run(); err != nil {
		log.Fatal(err)
	}
}
